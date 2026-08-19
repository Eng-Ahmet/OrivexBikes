// Central Application State
export const state = {
  activeStoreId: 1,
  activeRole: 'EMPLOYEE', // 'ADMIN' or 'EMPLOYEE'
  token: null,
  currentUser: {
    username: 'Sofia Employee',
    user_type: 'EMPLOYEE',
    store_id: 1
  },
  activeTab: 'fleetTab'
};

export const listeners = [];

export const subscribeState = (fn) => {
  listeners.push(fn);
};

export const notifyStateChange = () => {
  listeners.forEach(fn => fn(state));
};
