import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <CheckCircle size={56} className="text-green-600" />
    <h1 className="mt-4 text-2xl font-bold">Payment successful!</h1>
    <p className="mt-2 text-gray-500">
      Your enrollment is confirmed. It may take a few seconds for the webhook to finish processing.
    </p>
    <Link to="/my-learning" className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
      Go to My Learning
    </Link>
  </div>
);

export default PaymentSuccess;
