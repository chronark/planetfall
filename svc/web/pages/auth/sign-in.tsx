import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import { trpc } from "../../lib/hooks/trpc";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [form] = Form.useForm<{ email: string; otp: string }>();
  const createOTP = trpc.auth.createOTP.useMutation();
  const signIn = trpc.auth.signIn.useMutation();

  // useEffect(()=>{
  //   fetch("/api/x")
  // },[])

  return (
    <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
      <Card title="Sign Up">
        <Form
          onFinish={async ({ email, otp }) => {
            setLoading(true);
            if (step === "email") {
              await createOTP.mutateAsync({ email });
              setStep("otp");
            } else {
              const { redirect } = await signIn.mutateAsync({
                identifier: email,
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
            {step === "email" ? "Request Token" : "Sign In"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
