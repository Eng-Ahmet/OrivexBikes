// Toast Notification Manager for QQBikes
export function showToast(message, type = 'info', duration = 3500) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgMap = {
    success: 'linear-gradient(135deg, #10B981, #059669)',
    error: 'linear-gradient(135deg, #EF4444, #DC2626)',
    warning: 'linear-gradient(135deg, #F59E0B, #D97706)',
    info: 'linear-gradient(135deg, #3B82F6, #2563EB)'
  };

  toast.style.cssText = `
    background: ${bgMap[type] || bgMap.info};
    color: #FFFFFF;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease-out;
  `;

  const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
