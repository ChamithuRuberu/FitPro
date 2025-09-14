'use client';

import React from 'react';
import type { UserPaymentItem } from '@/lib/api';

interface PaymentHistoryProps {
  payments: UserPaymentItem[];
  loading?: boolean;
  error?: string | null;
}

export default function PaymentHistory({ payments, loading, error }: PaymentHistoryProps) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-4">Loading payment history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-4">No payments found</div>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // Sort by lastPaymentDate desc for history display
  const sorted = [...payments].sort((a, b) => new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime());

  return (
    <div className="p-6">
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {sorted.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900">Monthly Training Fee</p>
              <p className="text-sm text-gray-600">Paid on {formatDate(payment.lastPaymentDate)}</p>
              <p className="text-xs text-gray-500">Next due: {formatDate(payment.nextPaymentDate)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">LKR {payment.amount.toFixed(2)}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Paid
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


