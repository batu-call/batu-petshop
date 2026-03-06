"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck } from "lucide-react";
import { Order, CARGO_COMPANIES } from "./types";
import TrackingInfoCard from "./TrackingInfoCard";
import TrackingForm from "./TrackingForm";

interface Props {
  trackingModalOpen: boolean;
  setTrackingModalOpen: (v: boolean) => void;
  selectedTracking: Order | null;
  setSelectedTracking: (o: Order | null) => void;
  showShippingForm: boolean;
  setShowShippingForm: (v: boolean) => void;
  shippingForm: { trackingNumber: string; cargoCompany: (typeof CARGO_COMPANIES)[number]; estimatedDelivery: string };
  setShippingForm: (f: any) => void;
  updatingTracking: boolean;
  updateTracking: (orderId: string) => void;
  getTrackingSteps: (order: Order) => { label: string; completed: boolean; date: string; icon: React.ElementType }[];
  formatDate: (d: string) => string;
}

const TrackingModal = ({
  trackingModalOpen, setTrackingModalOpen, selectedTracking, setSelectedTracking,
  showShippingForm, setShowShippingForm, shippingForm, setShippingForm,
  updatingTracking, updateTracking, getTrackingSteps, formatDate,
}: Props) => {
  const closeModal = () => {
    setTrackingModalOpen(false);
    setSelectedTracking(null);
    setShowShippingForm(false);
  };

  return (
    <AnimatePresence>
      {trackingModalOpen && selectedTracking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#162820] rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">Track Package</h3>
                  <p className="text-sm text-gray-500 dark:text-[#7aab8a]">Order #{selectedTracking._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 dark:text-[#7aab8a] hover:text-gray-600 dark:hover:text-[#c8e6d0] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <TrackingInfoCard
              selectedTracking={selectedTracking}
              showShippingForm={showShippingForm}
              setShowShippingForm={setShowShippingForm}
              formatDate={formatDate}
            />

            {showShippingForm && (
              <TrackingForm
                shippingForm={shippingForm}
                setShippingForm={setShippingForm}
                updatingTracking={updatingTracking}
                onSave={() => updateTracking(selectedTracking._id)}
                onCancel={() => setShowShippingForm(false)}
              />
            )}

            <div className="space-y-4 mb-6">
              {getTrackingSteps(selectedTracking).map((step, idx) => {
                const StepIcon = step.icon;
                const steps = getTrackingSteps(selectedTracking);
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-[#97cba9] text-white"
                          : "bg-gray-200 dark:bg-[#1e3d2a] text-gray-400 dark:text-[#7aab8a]"
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.completed ? "bg-[#97cba9]" : "bg-gray-200 dark:bg-[#2d5a3d]"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`font-bold ${step.completed ? "text-gray-900 dark:text-[#c8e6d0]" : "text-gray-400 dark:text-[#7aab8a]"}`}>
                        {step.label}
                      </h4>
                      {step.date && <p className="text-sm text-gray-500 dark:text-[#7aab8a]">{step.date}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTracking.tracking?.estimatedDelivery && (
              <div className="pt-4 border-t border-gray-200 dark:border-[#2d5a3d]">
                <div className="bg-gray-50 dark:bg-[#1e3d2a] rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 dark:text-[#c8e6d0] mb-1">Estimated Delivery</h4>
                  <p className="text-2xl font-black text-[#97cba9]">
                    {formatDate(selectedTracking.tracking.estimatedDelivery)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrackingModal;