import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import InventoryChart from './InventoryChart';
import './AdminDashboard.css';

interface Stock {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  storeId: string;
  storeName: string;
  quantity: number;
  isDistributionCenterStock: boolean;
}

interface StoreInventorySummary {
  storeId: string;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

interface GlobalMetrics {
  totalStores: number;
  totalProducts: number;
  totalStockQuantity: number;
  distributionCenterQuantity: number;
  totalInventoryValue: number;
  totalOrders: number;
  totalRevenue: number;
}

interface AdminInventory {
  distributionCenterStock: Stock[];
  allStock: Stock[];
  storeInventories: StoreInventorySummary[];
  globalMetrics: GlobalMetrics;
}

const AdminDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<AdminInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'distribution' | 'stores'>('overview');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDistributionInventory();
      setInventory(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory data. Please try again.');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
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

  if (error || !inventory) {
    return (
      <main>
        <div className="container">
          <div className="error-message" role="alert">
            {error || 'Failed to load inventory data'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <div className="container">
        <h2 className="dashboard-title">Distribution Center Dashboard</h2>

        {/* Global Metrics */}
        <div className="metrics-grid-large">
          <div className="metric-card-large">
            <div className="metric-icon">🏪</div>
            <div className="metric-content">
              <div className="metric-value-large">{inventory.globalMetrics.totalStores}</div>
              <div className="metric-label-large">Total Stores</div>
            </div>
          </div>

          <div className="metric-card-large">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <div className="metric-value-large">{inventory.globalMetrics.totalProducts}</div>
              <div className="metric-label-large">Total Products</div>
            </div>
          </div>

          <div className="metric-card-large">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-value-large">{inventory.globalMetrics.totalStockQuantity}</div>
              <div className="metric-label-large">Total Stock Units</div>
            </div>
          </div>

          <div className="metric-card-large highlight">
            <div className="metric-icon">🏭</div>
            <div className="metric-content">
              <div className="metric-value-large">{inventory.globalMetrics.distributionCenterQuantity}</div>
              <div className="metric-label-large">DC Stock Units</div>
            </div>
          </div>

          <div className="metric-card-large">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <div className="metric-value-large">${inventory.globalMetrics.totalInventoryValue.toFixed(0)}</div>
              <div className="metric-label-large">Total Inventory Value</div>
            </div>
          </div>

          <div className="metric-card-large success">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <div className="metric-value-large">${inventory.globalMetrics.totalRevenue.toFixed(0)}</div>
              <div className="metric-label-large">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            Distribution Center
          </button>
          <button
            className={`tab ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            Store Analysis
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="card">
              <h3>Inventory Distribution by Store</h3>
              <InventoryChart data={inventory.storeInventories} />
            </div>

            <div className="card">
              <h3>Store Performance Summary</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Products</th>
                      <th>Total Units</th>
                      <th>Inventory Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.storeInventories.map((store) => (
                      <tr key={store.storeId}>
                        <td><strong>{store.storeName}</strong></td>
                        <td>{store.totalProducts}</td>
                        <td>{store.totalQuantity}</td>
                        <td>${store.totalValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="tab-content">
            <div className="card">
              <h3>Distribution Center Stock</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Store</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.distributionCenterStock.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                          No distribution center stock
                        </td>
                      </tr>
                    ) : (
                      inventory.distributionCenterStock.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>{item.productSku}</td>
                          <td>{item.storeName}</td>
                          <td>
                            <span className={item.quantity < 50 ? 'low-stock' : ''}>
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="tab-content">
            <div className="card">
              <h3>All Store Stock</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.allStock.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.storeName}</strong></td>
                        <td>{item.productName}</td>
                        <td>{item.productSku}</td>
                        <td>
                          <span className={item.quantity < 10 ? 'low-stock' : ''}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>
                          {item.isDistributionCenterStock ? (
                            <span className="badge badge-dc">DC</span>
                          ) : (
                            <span className="badge badge-store">Store</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;

