import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import { trpc } from "../../lib/hooks/trpc";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [form] = Form.useForm<{ email: string; name: string; otp: string }>();
  const createOTP = trpc.auth.createOTP.useMutation();
  const signUp = trpc.auth.signUp.useMutation();

  return (
    <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
      <Card title="Sign Up">
        <Form
          onFinish={async ({ email, name, otp }) => {
            setLoading(true);
            if (step === "email") {
              await createOTP.mutateAsync({ email });
              setStep("otp");
            } else {
              const { redirect } = await signUp.mutateAsync({
                identifier: email,
                name,
                otp,
              });
              router.push(redirect);
            }
            setLoading(false);
          }}
          form={form}
          labelCol={{ span: 8 }}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              disabled={step === "otp"}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input
              disabled={step === "otp"}
              style={{ width: "100%" }}
            />
          </Form.Item>

          {step === "otp"
            ? (
              <Form.Item
                label="OTP"
                name="otp"
                rules={[{ required: step === "otp" }]}
              >
                <Input
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )
            : null}

          <Button type="primary" htmlType="submit" block loading={loading}>
            {step === "email" ? "Request Token" : "Sign Up"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
