import React, { useState, useEffect } from 'react';
import { storeApi } from '../../services/api';
import './StoreOwnerDashboard.css';

interface Stock {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  updatedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName: string;
  createdAt: string;
}

interface Metrics {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  pendingOrders: number;
  totalOrderValue: number;
}

interface InventoryDashboard {
  storeId: string;
  storeName: string;
  stock: Stock[];
  recentOrders: Order[];
  metrics: Metrics;
}

const StoreOwnerDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateMode, setUpdateMode] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getInventory();
      setDashboard(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load dashboard. Please try again.');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string) => {
    try {
      setUpdating(true);
      await storeApi.updateStock(productId, newQuantity);
      await fetchDashboard();
      setUpdateMode(null);
      setNewQuantity(0);
    } catch (err: any) {
      alert('Failed to update stock. Please try again.');
      console.error('Error updating stock:', err);
    } finally {
      setUpdating(false);
    }
  };

  const startUpdate = (stock: Stock) => {
    setUpdateMode(stock.productId);
    setNewQuantity(stock.quantity);
  };

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">
            <div className="spinner" role="status" aria-label="Loading dashboard"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main>
        <div className="container">
          <div className="error-message" role="alert">
            {error || 'Failed to load dashboard'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-dashboard">
      <div className="container">
        <h2 className="dashboard-title">Store Dashboard - {dashboard.storeName}</h2>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{dashboard.metrics.totalProducts}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Quantity</div>
            <div className="metric-value">{dashboard.metrics.totalQuantity}</div>
          </div>

          <div className="metric-card alert-card">
            <div className="metric-label">Low Stock Items</div>
            <div className="metric-value">{dashboard.metrics.lowStockCount}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pending Orders</div>
            <div className="metric-value">{dashboard.metrics.pendingOrders}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Order Value</div>
            <div className="metric-value">${dashboard.metrics.totalOrderValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card">
          <h3>Current Inventory</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.stock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.productSku}</td>
                    <td>
                      <span className={item.quantity < 10 ? 'low-stock' : ''}>
                        {item.quantity}
                      </span>
                    </td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td>
                      {updateMode === item.productId ? (
                        <div className="update-controls">
                          <input
                            type="number"
                            className="quantity-input-inline"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                            min="0"
                            aria-label="New quantity"
                          />
                          <button
                            className="btn-small btn-success"
                            onClick={() => handleUpdateStock(item.productId)}
                            disabled={updating}
                          >
                            Save
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => setUpdateMode(null)}
                            disabled={updating}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => startUpdate(item)}
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3>Recent Orders</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  dashboard.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.customerName}</td>
                      <td>
                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StoreOwnerDashboard;

