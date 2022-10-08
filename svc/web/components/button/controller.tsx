import Link from "next/link";
import React, { MouseEvent } from "react";

export interface ButtonControllerProps {
  htmlType?: "submit" | "button";
  /**
   * Gets called when the user clicks on the button.
   */
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void | Promise<void>;

  disabled?: boolean;
}

export interface LinkControllerProps {
  /**
   * Relative to this page or absolute url.
   */
  href: string;

  /**
   * Opens a new browser page when clicking on it.
   */
  newTab?: boolean;
}

/**
 * Typeguard to check if props are LinkProps.
 */
function isLink(
  props: ButtonControllerProps | LinkControllerProps,
): props is LinkControllerProps {
  return "href" in props;
}

export function Controller(
  props: React.PropsWithChildren<ButtonControllerProps>,
): JSX.Element;
export function Controller(
  props: React.PropsWithChildren<LinkControllerProps>,
): JSX.Element;
export function Controller(
  props: React.PropsWithChildren<ButtonControllerProps | LinkControllerProps>,
): JSX.Element {
  if (isLink(props)) {
    return (
      <Link
        href={props.href}
        className="focus:outline-none"
        target={props.newTab ? "_blank" : undefined}
        rel={props.newTab ? "noopener noreferrer" : undefined}
      >
        {props.children}
      </Link>
    );
  }
  return (
    <button
      type={props.htmlType ?? "button"}
      onClick={props.onClick}
      className="focus:outline-none w-full"
    >
      {props.children}
    </button>
  );
}
