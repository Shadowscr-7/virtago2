"use client";

// Toast function will be set from the ToastIntegration component
let toastFunction:
  | ((toast: {
      title: string;
      description?: string;
      type: "success" | "error" | "info" | "warning";
    }) => void)
  | null = null;

export const setToastFunction = (
  toast: (toast: {
    title: string;
    description?: string;
    type: "success" | "error" | "info" | "warning";
  }) => void,
) => {
  toastFunction = toast;
};

export const showToast = (toast: {
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "warning";
}) => {
  if (toastFunction) {
    toastFunction(toast);
  }
};