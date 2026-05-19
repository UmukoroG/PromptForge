import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="p-8 rounded-lg w-full flex flex-col items-center justify-center bg-red-50 border border-red-200">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <p className="text-sm text-red-700 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
