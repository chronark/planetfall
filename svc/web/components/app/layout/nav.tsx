import React, { Fragment, PropsWithChildren, useEffect, useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@planetfall/svc/web/lib/hooks/trpc";
import { useSession, useUser } from "components/auth";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Button } from "components";
import { Form, Input, Menu, message, Modal, Space, Typography } from "antd";
import { router } from "@planetfall/svc/web/server/router";
import { checkIsManualRevalidate } from "next/dist/server/api-utils";
import { Logo } from "../../logo";

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

const Divider: React.FC = () => {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-slate-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
    </svg>
  );
};

const CreateNewTeam: React.FC = (): JSX.Element => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createTeam = trpc.team.create.useMutation();
  useEffect(() => {
    if (createTeam.error) {
      message.error(createTeam.error.message);
    }
  }, [createTeam.error]);

  const [form] = Form.useForm<{ name: string }>();

  return (
    <>
      <Button type="secondary" onClick={() => setOpen(true)}>
        Create new team
      </Button>
      <Modal
        title="Create Team"
        open={open}
        okText="Create"
        onOk={async () => {
          const { name } = await form.validateFields();
          const team = await createTeam.mutateAsync({ name });
          router.push(`/${team.slug}`);
        }}
        confirmLoading={createTeam.isLoading}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Form
          form={form}
          requiredMark="optional"
          layout="vertical"
        >
          <Space direction="vertical" size={32}>
            <Typography.Text style={{ alignItems: "center" }}>
              Create a new team to collaborate with others. Each team is
              isolated from each other and has separate billing.
            </Typography.Text>
            <Form.Item
              label="Name"
              name="name"
              required
              rules={[{ required: true, min: 4 }]}
            >
              <Input
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export type LayoutProps = {
  teamSelector?: boolean;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
};

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = (
  { children, breadcrumbs = [], teamSelector = true },
): JSX.Element => {
  const { signOut, invalidate } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const activeTeamSlug = router.query.teamSlug as string;

  const teams = trpc.team.list.useQuery();

  const userNavigation: any[] = [];

  const navigation = [
    { name: "Endpoints", href: `/${activeTeamSlug}/endpoints` },
    { name: "Pages", href: `/${activeTeamSlug}/pages` },
    { name: "Settings", href: `/${activeTeamSlug}/settings` },
  ];
  const invalidteam = teams.data &&
    !teams.data.find((t) => t.team.slug === activeTeamSlug);
  return (
    <div className="relative min-h-screen">
      <Disclosure as="header" className="bg-white shadow border-b">
        {({ open }) => (
          <>
            <div className="mx-auto container">
              <div className="relative flex h-16 justify-between">
                <div className="relative z-10 flex px-2 lg:px-0">
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol role="list" className="flex items-center space-x-4">
                      <li key="home">
                        <Link
                          href="/"
                          className="text-slate-900 font-bold hover:text-slate-800"
                        >
                          <Logo className="w-8 h-8" />
                        </Link>
                      </li>
                      {teamSelector && !invalidteam
                        ? (
                          <li key="dropdown">
                            <Dropdown.Root>
                              <div className="flex items-center px-2 py-1 gap-2 text-slate-500 hover:text-slate-700">
                                <Link
                                  href={`${activeTeamSlug}`}
                                  className="text-sm font-medium"
                                >
                                  {activeTeamSlug}
                                </Link>
                                <Dropdown.Trigger>
                                  <ChevronUpDownIcon className="w-5 h-5" />
                                </Dropdown.Trigger>
                              </div>
                              <Dropdown.Content className="z-50 bg-white rounded border border-slate-200 shadow-xl ">
                                <div className="px-4 py-3">
                                  <h3 className=" text-xs font-medium text-slate-500">
                                    Personal
                                  </h3>
                                  {(teams.data ?? []).filter((t) =>
                                    t.team.personal
                                  ).map((t) => (
                                    <Link
                                      key={t.teamId}
                                      href={`/${t.team.slug}`}
                                      className={classNames(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-500",
                                        {
                                          "bg-slate-500":
                                            t.team.slug === activeTeamSlug,
                                        },
                                      )}
                                    >
                                      {t.team.name}
                                    </Link>
                                  ))}
                                </div>

                                <div className="px-4 py-3">
                                  <h3 className=" text-xs font-medium text-slate-500">
                                    Teams
                                  </h3>
                                  <ul>
                                    {(teams.data ?? []).filter((t) =>
                                      !t.team.personal
                                    ).map((t) => (
                                      <Link
                                        key={t.teamId}
                                        href={`/${t.team.slug}`}
                                        className={classNames(
                                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-500",
                                          {
                                            "bg-slate-500":
                                              t.team.slug === activeTeamSlug,
                                          },
                                        )}
                                      >
                                        {t.team.name}
                                      </Link>
                                    ))}
                                  </ul>
                                </div>
                              </Dropdown.Content>
                            </Dropdown.Root>
                          </li>
                        )
                        : null}
                      {breadcrumbs.map((c, i) => (
                        <li key={c.label}>
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 flex-shrink-0 text-slate-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                            <Link
                              href={c.href}
                              className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-700"
                              aria-current={i - 1 === breadcrumbs.length
                                ? "page"
                                : undefined}
                            >
                              {c.label}
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>

                <div className="relative z-10 flex items-center lg:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none">
                    <span className="sr-only">Open menu</span>
                    {open
                      ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )
                      : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                  </Disclosure.Button>
                </div>
                <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
                  {
                    /* <button
                    type="button"
                    className="flex-shrink-0 rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none "
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button> */
                  }

                  {/* Profile dropdown */}
                  <Dropdown.Root>
                    <Dropdown.Trigger className="flex rounded-full bg-white focus:outline-none ">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user
                          ? user?.image ??
                            `https://ui-avatars.com/api/?size=32&name=${user?.name}`
                          : ""}
                        alt=""
                        width={32}
                        height={32}
                      />
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                      <Dropdown.Item key="sign-out">
                        <Button
                          type="secondary"
                          onClick={async () => {
                            await signOut();
                            invalidate();
                            router.push("/");
                          }}
                        >
                          Sign Out
                        </Button>
                      </Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown.Root>
                  {
                    /* <Menu as="div" className="relative ml-4 flex-shrink-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white focus:outline-none ">
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={user?.image ??
                            `https://ui-avatars.com/api/?size=32&name=${user?.name}`}
                          alt=""
                          width={32}
                          height={32}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg  focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-slate-100" : "",
                                  "block py-2 px-4 text-sm text-slate-700",
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={classNames(
                                active ? "bg-slate-100" : "",
                                "block py-2 px-4 text-sm text-slate-700 w-full text-left",
                              )}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu> */
                  }
                </div>
              </div>
              <nav
                className="hidden lg:flex lg:space-x-8 lg:pt-2"
                aria-label="Global"
              >
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      router.asPath.includes(item.href)
                        ? "border-slate-900 text-slate-900"
                        : "text-slate-700 border-transparent hover:border-slate-500 hover:text-slate-900 ",
                      "border-b  py-2 px-3 inline-flex duration-150 transition-all items-center text-sm font-medium",
                    )}
                    aria-current={item.href === router.asPath
                      ? "page"
                      : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            <Disclosure.Panel
              as="nav"
              className="lg:hidden"
              aria-label="Global"
            >
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.href === router.asPath
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-900 hover:bg-slate-50 hover:text-slate-900",
                      "block rounded-md py-2 px-3 text-base font-medium",
                    )}
                    aria-current={item.href === router.asPath
                      ? "page"
                      : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user?.image ??
                        `https://ui-avatars.com/api/?size=32&name=${user?.name}`}
                      alt=""
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800">
                      {user?.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md py-2 px-3 text-base font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={async () => {
                      await signOut();
                      invalidate;
                    }}
                    className="block rounded-md py-2 px-3 text-base font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Sign Out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="mx-auto container  pb-56 px-4 md:px-0">
        {children}
      </main>

      <footer className="absolute bottom-0 inset-x-0">
        <div className="border-t mt-16 py-8 ">
          <p className="mx-auto container text-base text-center text-slate-400">
            &copy; {new Date().getUTCFullYear()}{" "}
            planetfall.io - All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
