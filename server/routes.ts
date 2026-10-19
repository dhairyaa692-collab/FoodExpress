import express, { Request, Response } from 'express';
import { db, FoodItem, Order, OrderItem, OrderStatus, PaymentStatus } from './db.js';
import {
  createUserSession,
  generateSalt,
  getUserFromToken,
  hashPassword,
  invalidateUserSession,
  requireAdminAuth,
  requireUserAuth,
  optionalUserAuth,
  AuthenticatedRequest,
  verifyAdminPassword,
  createAdminSessionToken,
  verifyPassword,
} from './auth.js';
import { getAiCravingPredictions } from './ai.js';

export const apiRouter = express.Router();

// ==========================================
// 1. MENU & CATEGORIES (PUBLIC)
// ==========================================

apiRouter.get('/categories', (_req: Request, res: Response) => {
  const items = db.getFoodItems();
  const categoryCounts: Record<string, number> = {
    All: items.length,
    Pizza: 0,
    Burger: 0,
    Indian: 0,
    Chinese: 0,
    Snacks: 0,
    Desserts: 0,
    Beverages: 0,
  };

  items.forEach((item) => {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
  });

  const categories = [
    { id: 'all', name: 'All Items', icon: 'Utensils', count: categoryCounts['All'] },
    { id: 'pizza', name: 'Pizza', icon: 'Pizza', count: categoryCounts['Pizza'] },
    { id: 'burger', name: 'Burger', icon: 'Sandwich', count: categoryCounts['Burger'] },
    { id: 'indian', name: 'Indian', icon: 'Soup', count: categoryCounts['Indian'] },
    { id: 'chinese', name: 'Chinese', icon: 'ChefHat', count: categoryCounts['Chinese'] },
    { id: 'snacks', name: 'Snacks', icon: 'Popcorn', count: categoryCounts['Snacks'] },
    { id: 'desserts', name: 'Desserts', icon: 'Cake', count: categoryCounts['Desserts'] },
    { id: 'beverages', name: 'Beverages', icon: 'Coffee', count: categoryCounts['Beverages'] },
  ];

  res.json({ categories });
});

apiRouter.get('/menu', (req: Request, res: Response) => {
  let items = db.getFoodItems();
  const { search, category, vegOnly, sortBy, availableOnly } = req.query;

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.restaurant && item.restaurant.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
    items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  // Veg filter
  if (vegOnly === 'true') {
    items = items.filter((item) => item.isVeg);
  }

  // Availability filter (default true for regular customer view)
  if (availableOnly === 'true') {
    items = items.filter((item) => item.isAvailable);
  }

  // Sorting
  if (sortBy === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  } else {
    // Default popularity
    items.sort((a, b) => b.popularity - a.popularity);
  }

  res.json({ items });
});

apiRouter.get('/menu/:id', (req: Request, res: Response) => {
  const item = db.getFoodItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }
  res.json({ item });
});

// ==========================================
// 2. USER AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Full name, email, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const newUser = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    salt,
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = createUserSession(newUser.id);

  // Return user without sensitive hashes
  const { passwordHash: _, salt: __, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  const token = createUserSession(user.id);

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

apiRouter.post('/auth/logout', requireUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    invalidateUserSession(authHeader.substring(7).trim());
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', requireUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ user: safeUser });
});

apiRouter.put('/auth/profile', requireUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, phone, address } = req.body;

  const updates: Record<string, string> = {};
  if (name && typeof name === 'string') updates.name = name.trim();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (address !== undefined) updates.address = String(address).trim();

  const updated = db.updateUser(user.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { passwordHash: _, salt: __, ...safeUser } = updated;
  res.json({ user: safeUser, message: 'Profile updated successfully' });
});

// ==========================================
// 3. AI CRAVING PREDICTOR
// ==========================================

apiRouter.post('/ai/cravings', optionalUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : null;
    const preferences = Array.isArray(req.body.preferences) ? req.body.preferences : undefined;

    const result = await getAiCravingPredictions(userId, preferences);
    res.json(result);
  } catch (err) {
    console.error('Error generating AI cravings:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// ==========================================
// 4. ORDERS & CHECKOUT (CASH ON DELIVERY ONLY)
// ==========================================

apiRouter.post('/orders', optionalUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const { items, customerName, customerPhone, deliveryAddress, deliveryInstructions, paymentMethod } = req.body;

  // Enforce Cash on Delivery ONLY
  if (paymentMethod && paymentMethod !== 'Cash on Delivery') {
    res.status(400).json({
      error: 'Only Cash on Delivery (COD) is accepted on FoodExpress.',
    });
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty. Please add items before placing an order.' });
    return;
  }

  if (!customerName || !customerPhone || !deliveryAddress) {
    res.status(400).json({ error: 'Customer name, mobile number, and delivery address are required.' });
    return;
  }

  // Validate items and recalculate totals against trusted database prices
  const orderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const food = db.getFoodItemById(item.foodId);
    if (!food) {
      res.status(400).json({ error: `Dish "${item.name || item.foodId}" was not found in our menu.` });
      return;
    }
    if (!food.isAvailable) {
      res.status(400).json({ error: `Sorry, "${food.name}" is currently sold out / unavailable.` });
      return;
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    calculatedSubtotal += food.price * qty;

    orderItems.push({
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: qty,
      isVeg: food.isVeg,
      imageUrl: food.imageUrl,
    });
  }

  // Delivery fee policy: ₹40 standard, free over ₹499
  const deliveryFee = calculatedSubtotal >= 499 ? 0 : 40;
  const totalAmount = Number((calculatedSubtotal + deliveryFee).toFixed(2));
  calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

  // Generate unique order ID
  const orderId = `FX-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    id: orderId,
    userId: req.user ? req.user.id : `guest-${Date.now()}`,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    deliveryAddress: deliveryAddress.trim(),
    deliveryInstructions: deliveryInstructions ? deliveryInstructions.trim() : undefined,
    items: orderItems,
    subtotal: calculatedSubtotal,
    deliveryFee,
    totalAmount,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending - Cash on Delivery',
    orderStatus: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createOrder(newOrder);

  res.status(201).json({
    order: newOrder,
    message: 'Order placed successfully! Cash on Delivery confirmed.',
  });
});

apiRouter.get('/orders/my-orders', requireUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getUserOrders(req.user!.id);
  res.json({ orders });
});

apiRouter.get('/orders/:id', optionalUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // If user is logged in, verify ownership unless admin
  const adminToken = req.headers['x-admin-token'] as string;
  const isAdmin = adminToken && db.validateAdminSession(adminToken);

  if (!isAdmin && req.user && order.userId !== req.user.id && !order.userId.startsWith('guest-')) {
    res.status(403).json({ error: 'Access denied to this order' });
    return;
  }

  res.json({ order });
});

apiRouter.post('/orders/:id/cancel', optionalUserAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Authorization check
  const adminToken = req.headers['x-admin-token'] as string;
  const isAdmin = adminToken && db.validateAdminSession(adminToken);

  if (!isAdmin && req.user && order.userId !== req.user.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Cancellation rule: only allow if Pending or Confirmed
  if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
    res.status(400).json({
      error: `Order cannot be cancelled because it is already "${order.orderStatus}". Please contact support.`,
    });
    return;
  }

  const updated = db.updateOrderStatus(order.id, 'Cancelled');
  res.json({ order: updated, message: 'Order has been cancelled.' });
});

// ==========================================
// 5. ADMIN AUTHENTICATION & DASHBOARD
// ==========================================

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Admin password is required' });
    return;
  }

  const isValid = verifyAdminPassword(password);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid admin credentials' });
    return;
  }

  const token = createAdminSessionToken();
  res.json({
    success: true,
    token,
    message: 'Admin authentication successful',
  });
});

apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || '';
  if (token) {
    db.removeAdminSession(token);
  }
  res.json({ success: true, message: 'Admin logged out' });
});

apiRouter.get('/admin/verify', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ valid: true });
});

// Admin Dashboard Summary Cards
apiRouter.get('/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let ordersToday = 0;
  let ordersThisMonth = 0;
  let pendingOrders = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;
  let totalMonthRevenue = 0;
  let pendingCodAmount = 0;

  orders.forEach((o) => {
    const orderDate = new Date(o.createdAt);
    const dateStr = o.createdAt.slice(0, 10);

    // Today count
    if (dateStr === todayStr) {
      ordersToday++;
    }

    // Month count
    if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
      ordersThisMonth++;
      if (o.orderStatus !== 'Cancelled') {
        totalMonthRevenue += o.totalAmount;
      }
    }

    // Status breakdown
    if (o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing') {
      pendingOrders++;
    }
    if (o.orderStatus === 'Delivered') {
      deliveredOrders++;
    }
    if (o.orderStatus === 'Cancelled') {
      cancelledOrders++;
    }

    // Cash on delivery pending collection
    if (o.paymentStatus === 'Pending - Cash on Delivery' && o.orderStatus !== 'Cancelled') {
      pendingCodAmount += o.totalAmount;
    }
  });

  res.json({
    totalOrders: orders.length,
    ordersToday,
    ordersThisMonth,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalMonthRevenue: Number(totalMonthRevenue.toFixed(2)),
    pendingCodAmount: Number(pendingCodAmount.toFixed(2)),
  });
});

// Monthly Order Analytics & Comparisons
apiRouter.get('/admin/analytics', requireAdminAuth, (req: Request, res: Response) => {
  const orders = db.getOrders();
  const now = new Date();

  const selectedYear = parseInt(req.query.year as string, 10) || now.getFullYear();
  const selectedMonth = parseInt(req.query.month as string, 10) || (now.getMonth() + 1); // 1-12

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dailyData: Record<number, { day: number; date: string; orders: number; revenue: number; codCollected: number }> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const padD = d < 10 ? `0${d}` : `${d}`;
    const padM = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    dailyData[d] = {
      day: d,
      date: `${padM}/${padD}`,
      orders: 0,
      revenue: 0,
      codCollected: 0,
    };
  }

  // Filter orders for selected month
  let selectedMonthTotalOrders = 0;
  let selectedMonthRevenue = 0;
  let selectedMonthDelivered = 0;
  let selectedMonthCodPending = 0;

  orders.forEach((o) => {
    const date = new Date(o.createdAt);
    if (date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth) {
      const day = date.getDate();
      selectedMonthTotalOrders++;

      if (o.orderStatus !== 'Cancelled') {
        selectedMonthRevenue += o.totalAmount;
        if (dailyData[day]) {
          dailyData[day].orders += 1;
          dailyData[day].revenue += o.totalAmount;
        }
      }

      if (o.orderStatus === 'Delivered') {
        selectedMonthDelivered++;
      }

      if (o.paymentStatus === 'Collected - Cash on Delivery') {
        if (dailyData[day]) {
          dailyData[day].codCollected += o.totalAmount;
        }
      } else if (o.orderStatus !== 'Cancelled') {
        selectedMonthCodPending += o.totalAmount;
      }
    }
  });

  const dailyChart = Object.values(dailyData).map((d) => ({
    ...d,
    revenue: Number(d.revenue.toFixed(2)),
    codCollected: Number(d.codCollected.toFixed(2)),
  }));

  // Month-by-month comparison for the whole year
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyComparison = monthNames.map((name, index) => {
    const m = index + 1;
    let mOrders = 0;
    let mRevenue = 0;

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selectedYear && d.getMonth() + 1 === m) {
        mOrders++;
        if (o.orderStatus !== 'Cancelled') {
          mRevenue += o.totalAmount;
        }
      }
    });

    return {
      month: name,
      monthNumber: m,
      orders: mOrders,
      revenue: Number(mRevenue.toFixed(2)),
    };
  });

  res.json({
    year: selectedYear,
    month: selectedMonth,
    summary: {
      totalOrders: selectedMonthTotalOrders,
      revenue: Number(selectedMonthRevenue.toFixed(2)),
      delivered: selectedMonthDelivered,
      codPending: Number(selectedMonthCodPending.toFixed(2)),
    },
    dailyChart,
    monthlyComparison,
  });
});

// Admin All Orders List with search/filter/sort
apiRouter.get('/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  let orders = db.getOrders();
  const { status, paymentStatus, search, sortBy } = req.query;

  if (status && typeof status === 'string' && status !== 'All') {
    orders = orders.filter((o) => o.orderStatus === status);
  }

  if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'All') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'amount-desc') {
    orders.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (sortBy === 'amount-asc') {
    orders.sort((a, b) => a.totalAmount - b.totalAmount);
  } else if (sortBy === 'date-asc') {
    orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    // Default newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ orders });
});

// Admin Update Order Status
apiRouter.patch('/admin/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status: ${status}` });
    return;
  }

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order: updated, message: `Order status changed to ${status}` });
});

// Admin Update Order Payment Status (e.g. mark COD as Collected)
apiRouter.patch('/admin/orders/:id/payment', requireAdminAuth, (req: Request, res: Response) => {
  const { paymentStatus } = req.body;
  const validPaymentStatuses: PaymentStatus[] = ['Pending - Cash on Delivery', 'Collected - Cash on Delivery'];

  if (!validPaymentStatuses.includes(paymentStatus)) {
    res.status(400).json({ error: `Invalid payment status: ${paymentStatus}` });
    return;
  }

  const updated = db.updateOrderPaymentStatus(req.params.id, paymentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order: updated, message: `Payment marked as ${paymentStatus}` });
});

// Admin Export CSV
apiRouter.get('/admin/export-csv', requireAdminAuth, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Items', 'Total Amount', 'Payment Status', 'Order Status'];

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
    return [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      o.totalAmount.toFixed(2),
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=foodexpress-orders-${Date.now()}.csv`);
  res.send(csv);
});

// ==========================================
// 6. ADMIN FOOD & MENU MANAGEMENT
// ==========================================

apiRouter.post('/admin/menu', requireAdminAuth, (req: Request, res: Response) => {
  const { name, description, price, category, restaurant, isVeg, imageUrl, prepTimeMinutes, isAvailable } = req.body;

  if (!name || !description || price === undefined || !category) {
    res.status(400).json({ error: 'Name, description, price, and category are required' });
    return;
  }

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    res.status(400).json({ error: 'Valid positive price is required' });
    return;
  }

  const defaultImg = isVeg
    ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  const newItem: FoodItem = {
    id: `food-${category.toLowerCase().slice(0, 3)}-${Date.now()}`,
    name: name.trim(),
    description: description.trim(),
    price: Math.round(numPrice),
    category,
    restaurant: restaurant && restaurant.trim() ? restaurant.trim() : 'FoodExpress Kitchen',
    isVeg: Boolean(isVeg),
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : defaultImg,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    popularity: 85,
    rating: 4.8,
    prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 15,
    createdAt: new Date().toISOString(),
  };

  db.createFoodItem(newItem);
  res.status(201).json({ item: newItem, message: 'Dish added to menu successfully' });
});

apiRouter.put('/admin/menu/:id', requireAdminAuth, (req: Request, res: Response) => {
  const item = db.getFoodItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }

  const { name, description, price, category, restaurant, isVeg, imageUrl, prepTimeMinutes, isAvailable } = req.body;
  const updates: Partial<FoodItem> = {};

  if (name) updates.name = name.trim();
  if (description) updates.description = description.trim();
  if (price !== undefined) {
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice) && numPrice > 0) {
      updates.price = Math.round(numPrice);
    }
  }
  if (category) updates.category = category;
  if (restaurant) updates.restaurant = restaurant.trim();
  if (isVeg !== undefined) updates.isVeg = Boolean(isVeg);
  if (imageUrl) updates.imageUrl = imageUrl.trim();
  if (prepTimeMinutes !== undefined) updates.prepTimeMinutes = parseInt(prepTimeMinutes, 10) || 15;
  if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);

  const updated = db.updateFoodItem(req.params.id, updates);
  res.json({ item: updated, message: 'Dish updated successfully' });
});

apiRouter.patch('/admin/menu/:id/toggle-availability', requireAdminAuth, (req: Request, res: Response) => {
  const item = db.getFoodItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }

  const updated = db.updateFoodItem(req.params.id, { isAvailable: !item.isAvailable });
  res.json({
    item: updated,
    message: `${updated?.name} is now ${updated?.isAvailable ? 'Available' : 'Unavailable'}`,
  });
});

apiRouter.delete('/admin/menu/:id', requireAdminAuth, (req: Request, res: Response) => {
  const deleted = db.deleteFoodItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }
  res.json({ success: true, message: 'Dish removed from menu' });
});

// Reset seeds
apiRouter.post('/admin/reset-seeds', requireAdminAuth, (_req: Request, res: Response) => {
  db.resetToSeeds();
  res.json({ success: true, message: 'Database reset to initial demo seeds' });
});
