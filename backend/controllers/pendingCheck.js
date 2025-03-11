// Function to check if a user account is pending
const isPendingAccount = (user) => {
  // Check both status='pending' or is_approved=0
  return (user.status === 'pending' || (user.status !== 'headman' && user.is_approved === 0));
};

module.exports = isPendingAccount;// Function to check if a user account is pending
