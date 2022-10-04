import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { trpc } from "../../lib/hooks/trpc";
import { useSession } from "../../components/auth";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [form] = Form.useForm<{ email: string; otp: string }>();
  const requestSignIn = trpc.auth.requestSignIn.useMutation();
  const verifySignIn = trpc.auth.verifySignIn.useMutation();

  useEffect(() => {
    if (requestSignIn.error) {
      message.error(requestSignIn.error.message);
    }
  }, [requestSignIn.error]);

  useEffect(() => {
    if (verifySignIn.error) {
      message.error(verifySignIn.error.message);
    }
  }, [verifySignIn.error]);

  const { session } = useSession();
  useEffect(() => {
    if (session.signedIn) {
      router.push("/home");
    }
  }, [session.signedIn]);

  return (
    <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
      <Card title="Sign In">
        <Form
          onFinish={async ({ email, otp }) => {
            setLoading(true);
            if (step === "email") {
              const { redirect } = await requestSignIn.mutateAsync({ email });
              if (redirect) {
                router.push(redirect);
                return;
              }
              setStep("otp");
            } else {
              const { redirect } = await verifySignIn.mutateAsync({
                identifier: email,
                otp,
              });

              router.push("/home");
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
