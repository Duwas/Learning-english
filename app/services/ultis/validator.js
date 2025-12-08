export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
export const isValidPhone = (phone) => {
    const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return regex.test(phone);
};export const isValidPassword = (password) => {
    return password && password.length >= 8;
};export const getPasswordInputType = (show) => {
  return show ? 'text' : 'password';
};