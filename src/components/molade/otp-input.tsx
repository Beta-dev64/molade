import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

/** 6-character Molade OTP UI: XXX − XXX */
export function MoladeOtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={(v) => onChange(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
      disabled={disabled}
      containerClassName="justify-center"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
        <InputOTPSlot index={1} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
        <InputOTPSlot index={2} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
        <InputOTPSlot index={4} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
        <InputOTPSlot index={5} className="size-11 text-base font-semibold first:rounded-lg last:rounded-lg" />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function formatOtpForApi(value: string) {
  const n = value.replace(/[-\s]/g, "").toUpperCase();
  if (n.length !== 6) return n;
  return `${n.slice(0, 3)}-${n.slice(3)}`;
}
