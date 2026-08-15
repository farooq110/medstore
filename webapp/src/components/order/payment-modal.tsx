import React from 'react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { Order } from '@/src/types';
import { useAddPayment } from '@/src/hooks/use-orders';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  paymentAmount: number | "";
  setPaymentAmount: (paymentAmount: number | "") => void;
  paymentMethod: string;
  setPaymentMethod: (paymentMethod: string) => void;
  paymentNotes: string;
  setPaymentNotes: (paymentNotes: string) => void;
  order: Order | null;
  addPayment: ReturnType<typeof useAddPayment>;
}

const PaymentModal = ({ isOpen, onClose, onSubmit, paymentAmount, setPaymentAmount, paymentMethod, setPaymentMethod, paymentNotes, setPaymentNotes, order, addPayment }: PaymentModalProps) => {
  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value ? parseFloat(e.target.value) : "")}
              max={order?.dueAmount}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="check">Check</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!paymentAmount || paymentAmount <= 0 || addPayment.isPending}
            >
              {addPayment.isPending ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        </div>
      </Modal>
  )
}

export default PaymentModal