export const urlRegex =
  /^(https?:\/\/)?(www\.)?((?!http|www\.)[a-zA-Z0-9-]+\.){1,2}[a-zA-Z]{2,6}(:\d{1,5})?(\/[^\s]*)?(\?.*)?$/;
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const phoneNumberRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()]).*$/;
export const zipCodeRegex = /^\d{5}(-\d{4})?$/;
