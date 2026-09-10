import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);

  const load = () => api.get('/admin/payouts').then((res) => setPayouts(res.data.payouts));

  useEffect(() => {
    load();
  }, []);

  const markPaid = async (paymentId) => {
    try {
      await api.put(`/admin/payouts/${paymentId}/mark-paid`);
      toast.success('Marked as paid');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Instructor Payouts</h1>
      {payouts.length === 0 ? (
        <p className="text-gray-500">No completed payments yet.</p>
      ) : (
        <div className="space-y-6">
          {payouts.map((p) => (
            <div key={p.instructor._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{p.instructor.name}</h3>
                  <p className="text-sm text-gray-500">{p.instructor.email}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Total earned: <span className="font-semibold">${p.totalEarned.toFixed(2)}</span></p>
                  <p className="text-amber-600">Unpaid: ${p.unpaidAmount.toFixed(2)}</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-1">Course</th>
                    <th className="py-1">Amount (70%)</th>
                    <th className="py-1">Status</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {p.payments.map((pay) => (
                    <tr key={pay._id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-1.5">{pay.course?.title}</td>
                      <td className="py-1.5">${(pay.amount * 0.7).toFixed(2)}</td>
                      <td className="py-1.5 capitalize">{pay.payoutStatus}</td>
                      <td className="py-1.5">
                        {pay.payoutStatus === 'unpaid' && (
                          <button onClick={() => markPaid(pay._id)} className="text-xs font-medium text-brand-600">
                            Mark as paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payouts;
