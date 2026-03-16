import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface ShippingAddressFormProps {
  fullName: string;    setFullName:    (v: string) => void;
  email: string;       setEmail:       (v: string) => void;
  city: string;        setCity:        (v: string) => void;
  phoneNumber: string; setPhoneNumber: (v: string) => void;
  address: string;     setAddress:     (v: string) => void;
  postalCode: string;  setPostalCode:  (v: string) => void;
  isDark: boolean;
}

const inputCls = `
  w-full h-11 px-4 rounded-lg border
  border-[#B1CBBB] dark:border-[#2d5a3d]
  bg-[#D6EED6]/30 dark:bg-[#0d1f18]
  text-[#393E46] dark:text-[#c8e6d0]
  placeholder:text-[#B1CBBB] dark:placeholder:text-[#2d5a3d]
  focus:outline-none focus:ring-2 focus:ring-[#97cba9]/40 focus:border-[#97cba9]
  dark:focus:border-[#0b8457] dark:focus:ring-[#0b8457]/20
  transition-all text-sm
`.replace(/\s+/g, " ").trim();

const labelCls =
  "block text-xs font-semibold mb-1.5 tracking-wide uppercase text-[#393E46] dark:text-[#B1CBBB]";

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

function Field({ label, id, type = "text", value, onChange, placeholder, required, optional, className = "" }: FieldProps) {
  const isEmpty = required && value !== "" && !value.trim();
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {optional && <span className="ml-1 normal-case font-normal text-[#B1CBBB] dark:text-[#2d5a3d]">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`${inputCls} ${isEmpty ? "border-red-400 focus:border-red-400 focus:ring-red-300/30" : ""}`}
      />
    </div>
  );
}

const borderColor = (dark: boolean) => dark ? "#2d5a3d" : "#B1CBBB";

const ShippingAddressForm = ({
  fullName, setFullName,
  email, setEmail,
  city, setCity,
  phoneNumber, setPhoneNumber,
  address, setAddress,
  postalCode, setPostalCode,
  isDark,
}: ShippingAddressFormProps) => {
  return (
    <div className="w-full border border-[#B1CBBB] dark:border-[#2d5a3d] rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row min-h-80">

        {/* LEFT PANEL */}
        <div className="hidden sm:flex sm:w-[30%] flex-col justify-between relative overflow-hidden bg-[#D6EED6] dark:bg-[#0b1f16]">

          {/* top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1" />

          {/* decorative rings */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-[#97cba9]/40 dark:border-[#0b8457]/20 pointer-events-none" />
          <div className="absolute top-16 -left-6 w-20 h-20 rounded-full border border-[#97cba9]/30 dark:border-[#0b8457]/15 pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-[#97cba9]/30 dark:border-[#0b8457]/15 pointer-events-none" />

          {/* content */}
          <div className="relative z-10 p-6 flex flex-col justify-between min-h-80">

            {/* top */}
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#97cba9]/40 dark:bg-[#0b8457]/30 border border-[#97cba9] dark:border-[#0b8457]/60 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-[#393E46] dark:text-[#97cba9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[#393E46] dark:text-[#c8e6d0] text-sm font-bold leading-snug">
                Shipping Address
              </h3>
              <p className="text-[#393E46]/60 dark:text-[#B1CBBB]/60 text-[11px] mt-2 leading-relaxed">
                Enter your delivery details to complete the order.
              </p>
            </div>

            {/* checklist */}
            <div className="flex flex-col gap-2.5 mt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#393E46]/40 dark:text-[#2d5a3d] mb-0.5">
                Required
              </p>
              {["Full Name", "Email", "City", "Phone", "Address"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[#97cba9] dark:border-[#0b8457]/60 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#97cba9] dark:bg-[#0b8457]" />
                  </div>
                  <span className="text-[#393E46]/70 dark:text-[#B1CBBB]/70 text-xs">{f}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-4 h-4 rounded-full border border-[#B1CBBB] dark:border-[#2d5a3d] flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B1CBBB] dark:bg-[#2d5a3d]" />
                </div>
                <span className="text-[#393E46]/50 dark:text-[#B1CBBB]/40 text-xs">Postal Code</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 p-5 sm:p-6 bg-white dark:bg-[#111c16]">

          {/* Mobile title */}
          <div className="sm:hidden mb-5 pb-3 border-b border-[#B1CBBB]/50 dark:border-[#2d5a3d]">
            <h2 className="text-[#393E46] dark:text-[#c8e6d0] text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-[#97cba9] dark:text-[#0b8457] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Shipping Address
            </h2>
          </div>

          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" id="fullName" value={fullName} onChange={setFullName} placeholder="John Doe" required />
              <Field label="Email" id="email" type="email" value={email} onChange={setEmail} placeholder="john@example.com" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" id="city" value={city} onChange={setCity} placeholder="New York" required />
              <div>
                <label className={labelCls}>Phone</label>
                <PhoneInput
                  country={"us"}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  inputStyle={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: borderColor(isDark),
                    background: isDark ? "#0d1f18" : "rgba(214, 238, 214, 0.3)",
                    color: isDark ? "#c8e6d0" : "#393E46",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    paddingLeft: "52px",
                  }}
                  buttonStyle={{
                    background: "transparent",
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "0px",
                    borderStyle: "solid",
                    borderColor: borderColor(isDark),
                    borderRadius: "8px 0 0 8px",
                  }}
                  specialLabel=""
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className={labelCls}>Street Address</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Maple Street"
                rows={2}
                autoComplete="off"
                className={`
                  w-full px-4 py-3 rounded-lg border resize-none
                  border-[#B1CBBB] dark:border-[#2d5a3d]
                  bg-[#D6EED6]/30 dark:bg-[#0d1f18]
                  text-[#393E46] dark:text-[#c8e6d0]
                  placeholder:text-[#B1CBBB] dark:placeholder:text-[#2d5a3d]
                  focus:outline-none focus:ring-2 focus:ring-[#97cba9]/40 focus:border-[#97cba9]
                  dark:focus:border-[#0b8457] dark:focus:ring-[#0b8457]/20
                  transition-all text-sm
                  ${address !== "" && !address.trim() ? "border-red-400" : ""}
                `}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Postal Code" id="postalCode" value={postalCode} onChange={setPostalCode} placeholder="10001" optional />
              <div />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ShippingAddressForm;