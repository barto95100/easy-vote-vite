export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmails = (emails: string[]): string[] => {
  const invalidEmails = emails.filter(email => !validateEmail(email));
  if (invalidEmails.length > 0) {
    throw new Error(`Emails invalides : ${invalidEmails.join(', ')}`);
  }
  return emails;
}; 