"use client";

import {
  Drawer,
  Button,
  ScrollShadow,
  UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";

interface AppDrawerProps {
  state: UseOverlayStateReturn;
  children: React.ReactNode;
  placement?: "right" | "left" | "top" | "bottom";
  backdropVariant?: "blur" | "transparent" | "opaque";
  width?: string;
}

export default function AppDrawer({
  state,
  children,
  placement = "right",
  backdropVariant = "blur",
  width = "w-lg",
}: AppDrawerProps) {
  return (
    <Drawer state={state}>
      <Button className="hidden" aria-hidden="true" excludeFromTabOrder />

      <Drawer.Backdrop variant={backdropVariant}>
        <Drawer.Content placement={placement}>
          <Drawer.Dialog className="w-fit">
            <Drawer.CloseTrigger />
            <Drawer.Body className="px-2 py-6">
              <ScrollShadow hideScrollBar className="h-full overflow-y-auto">
                <div className={`${width} px-1`}>{children}</div>
              </ScrollShadow>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
