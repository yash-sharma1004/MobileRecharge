/**
 * Dynamically loads the Razorpay checkout script and returns a Promise.
 * Reuses the script if it is already injected.
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // If Razorpay is already available globally, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if the script has already been injected but hasn't fully loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    // Inject the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
