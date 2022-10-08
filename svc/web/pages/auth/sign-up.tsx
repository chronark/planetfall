import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { trpc } from "../../lib/hooks/trpc";
import { useSession } from "../../components/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Loading } from "../../components/loading";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const requestSignUp = trpc.auth.requestSignUp.useMutation();
  const verifySignUp = trpc.auth.verifySignUp.useMutation();

  useEffect(() => {
    if (requestSignUp.error) {
      message.error(requestSignUp.error.message);
    }
  }, [requestSignUp.error]);

  useEffect(() => {
    if (verifySignUp.error) {
      message.error(verifySignUp.error.message);
    }
  }, [verifySignUp.error]);

  const emailForm = useForm<{ email: string; name: string }>();
  const otpForm = useForm<{ otp: string }>();

  const { session } = useSession();
  useEffect(() => {
    if (session.signedIn) {
      router.push("/home");
    }
  }, [session.signedIn, router]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="grow">
        <section className="relative">
          {/* Illustration */}

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-primary-500">
                  Planetfall
                </h2>
                <p className="mt-1 text-4xl font-bold tracking-tight ttext-slate-900 sm:text-5xl lg:text-6xl">
                  Sign Up
                </p>
              </div>
              {/* Form */}
              <div className="max-w-sm mx-auto">
                {step === "email"
                  ? (
                    <form>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email address
                          </label>

                          <input
                            id="email"
                            className="transition-all focus:bg-slate-50 md:px-4 md:py-3 font-medium w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                            type="email"
                            placeholder="Email"
                            {...emailForm.register("email", { required: true })}
                          />
                          {emailForm.formState.errors.email && (
                            <span>This field is required</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Name
                          </label>

                          <input
                            id="name"
                            className="transition-all focus:bg-slate-50 md:px-4 md:py-3 font-medium w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                            type="text"
                            placeholder="Username"
                            {...emailForm.register("name", { required: true })}
                          />
                          {emailForm.formState.errors.name && (
                            <span>This field is required</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={emailForm.handleSubmit(async ({ email }) => {
                            setLoading(true);
                            const { redirect } = await requestSignUp
                              .mutateAsync({
                                email,
                              });
                            if (redirect) {
                              router.push(redirect);
                              return;
                            }
                            setStep("otp");
                            setLoading(false);
                          })}
                          className="w-full transition-all hover:cursor-pointer whitespace-nowrap md:px-4 md:py-3 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out  md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group "
                        >
                          {loading ? <Loading /> : "Request Token"}
                        </button>
                      </div>
                    </form>
                  )
                  : (
                    <form>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="identifier"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email
                          </label>

                          <input
                            disabled
                            id="identifier"
                            className="transition-all md:px-4 md:py-3 font-medium w-full border-slate-700 border rounded bg-slate-100 cursor-not-allowed"
                            value={emailForm.getValues().email}
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Name
                          </label>

                          <input
                            disabled
                            id="name"
                            className="transition-all md:px-4 md:py-3 font-medium w-full border-slate-700 border rounded bg-slate-100 cursor-not-allowed"
                            value={emailForm.getValues().name}
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="otp"
                            className="block text-sm font-medium text-gray-700"
                          >
                            OTP
                          </label>

                          <input
                            id="otp"
                            className="transition-all focus:bg-slate-50 md:px-4 md:py-3 font-medium w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                            placeholder="* * * * * *"
                            {...otpForm.register("otp", { required: true })}
                          />
                          {otpForm.formState.errors.otp && (
                            <span>This field is required</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={otpForm.handleSubmit(async ({ otp }) => {
                            setLoading(true);
                            await verifySignUp.mutateAsync({
                              identifier: emailForm.getValues().email,
                              name: emailForm.getValues().name,
                              otp,
                            });

                            router.push("/home");
                            setLoading(false);
                          })}
                          className="w-full transition-all hover:cursor-pointer whitespace-nowrap md:px-4 md:py-3 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out  md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group "
                        >
                          {loading ? <Loading /> : "VerifyToken"}
                        </button>
                      </div>
                    </form>
                  )}

                <div className="text-center mt-6">
                  <div className="text-sm text-slate-500">
                    Already have an account yet?{" "}
                    <Link
                      className="font-medium text-primary-500"
                      href="/auth/sign-in"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    // <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
    //   <Card title="Sign In">
    //     <Form
    //       onFinish={async ({ email, otp }) => {
    //         setLoading(true);
    //         if (step === "email") {
    //           const { redirect } = await requestSignUp.mutateAsync({ email });
    //           if (redirect) {
    //             router.push(redirect);
    //             return;
    //           }
    //           setStep("otp");
    //         } else {
    //           const { redirect } = await verifySignUp.mutateAsync({
    //             identifier: email,
    //             otp,
    //           });

    //           router.push("/home");
    //         }
    //         setLoading(false);
    //       }}
    //       form={form}
    //       labelCol={{ span: 8 }}
    //       layout="vertical"
    //     >
    //       <Form.Item
    //         label="Email"
    //         name="email"
    //         rules={[{ required: true, type: "email" }]}
    //       >
    //         <Input
    //           disabled={step === "otp"}
    //           style={{ width: "100%" }}
    //         />
    //       </Form.Item>

    //       {step === "otp"
    //         ? (
    //           <Form.Item
    //             label="OTP"
    //             name="otp"
    //             rules={[{ required: step === "otp" }]}
    //           >
    //             <Input
    //               style={{ width: "100%" }}
    //             />
    //           </Form.Item>
    //         )
    //         : null}

    //       <Button type="primary" htmlType="submit" block loading={loading}>
    //         {step === "email" ? "Request Token" : "Sign In"}
    //       </Button>
    //     </Form>
    //   </Card>
    // </div>
  );
}
