import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Form, Input, message, Typography } from "antd";

import { trpc } from "../../lib/hooks/trpc";
import { useSession } from "../../components/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button, Loading } from "components";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
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

  const emailForm = useForm<{ email: string }>();
  const otpForm = useForm<{ otp: string }>();

  const { session, invalidate } = useSession();
  useEffect(() => {
    if (session.signedIn) {
      router.push("/home");
    }
  }, [session.signedIn, router]);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <div className="absolute">
        <svg
          className="inset-0 w-screen fill-transparent h-screen [mask-image:linear-gradient(to_bottom,white_0%,transparent_80%)]"
          viewBox="0 0 256 256"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grad1">
              <stop offset={0} stopColor="red" />
              <stop offset={1} stopColor="blue" />
            </linearGradient>
          </defs>

          <path
            stroke="url(#grad1)"
            strokeWidth={0.2}
            d="M128.5 219.236c-.309.178-.69.178-1 0l-78.262-45.185a1 1 0 0 1-.5-.866v-90.37a1 1 0 0 1 .5-.866L127.5 36.764a1 1 0 0 1 1 0l31.923 18.43a1 1 0 0 0 1.237-.19l9.691-10.57a1 1 0 0 0-.237-1.542L128.5 18.289a1 1 0 0 0-1 0L33.238 72.71a1 1 0 0 0-.5.866v108.845c0 .358.19.688.5.866l94.262 54.423a.998.998 0 0 0 1 0l94.263-54.423a1 1 0 0 0 .5-.866v-49.206a1 1 0 0 0-1.217-.976l-14 3.108a1.001 1.001 0 0 0-.783.976v36.861a1 1 0 0 1-.5.866L128.5 219.236Z"
          />
          <path
            stroke="url(#grad1)"
            strokeWidth={0.2}
            d="M223.321 105.737a1 1 0 0 0-1.387-.92l-87.51 36.649c-1.125.471-.588 2.163.603 1.899l87.541-19.436a.999.999 0 0 0 .783-.978l-.03-17.214ZM118.207 114.232c-.824.899.372 2.21 1.343 1.472l75.494-57.462a1 1 0 0 0-.104-1.66l-14.892-8.634a1 1 0 0 0-1.239.19l-60.602 66.094ZM203.173 62.11a.999.999 0 0 1 1.105-.071l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397Z"
          />
          <path
            stroke="url(#grad1)"
            strokeWidth={0.2}
            d="M88.026 152.224c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397a.999.999 0 0 1 1.105-.07l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38Z"
          />
        </svg>
      </div>
      <main className="h-full">
        <section className="relative">
          {/* Illustration */}

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* Page header */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-primary-500">
                  Planetfall
                </h2>
                <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Sign In
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
                            className="transition-all focus:bg-slate-50 px-4 py-3 font-medium w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                            type="email"
                            placeholder="Email"
                            {...emailForm.register("email", { required: true })}
                          />
                          {emailForm.formState.errors.email && (
                            <span>This field is required</span>
                          )}
                        </div>
                        <div className="w-full">
                          <Button
                            block
                            onClick={emailForm.handleSubmit(
                              async ({ email }) => {
                                setLoading(true);
                                const { redirect } = await requestSignIn
                                  .mutateAsync({
                                    email,
                                  });
                                if (redirect) {
                                  router.push(redirect);
                                  return;
                                }
                                setStep("otp");
                                setLoading(false);
                              },
                            )}
                          >
                            Request Token
                          </Button>
                        </div>
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
                        <Button
                          block
                          onClick={otpForm.handleSubmit(async ({ otp }) => {
                            setLoading(true);
                            await verifySignIn.mutateAsync({
                              identifier: emailForm.getValues().email,
                              otp,
                            });
                            invalidate();

                            router.push("/home");
                            setLoading(false);
                          })}
                        >
                          VerifyToken
                        </Button>
                      </div>
                    </form>
                  )}

                <div className="text-center mt-6">
                  <div className="text-sm text-slate-500">
                    Don&apos;t have an account yet?{" "}
                    <Link
                      className="font-medium text-primary-500"
                      href="/auth/sign-up"
                    >
                      Sign up for free
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
    //           const { redirect } = await requestSignIn.mutateAsync({ email });
    //           if (redirect) {
    //             router.push(redirect);
    //             return;
    //           }
    //           setStep("otp");
    //         } else {
    //           const { redirect } = await verifySignIn.mutateAsync({
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
