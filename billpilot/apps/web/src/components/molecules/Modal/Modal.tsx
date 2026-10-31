'use client';

import { cn } from '@/lib/cn';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon } from 'lucide-react';
import React from 'react';

type ModalType = typeof Dialog.Root & {
  Close: typeof ModalClose;
  Content: typeof ModalContent;
  Description: typeof ModalDescription;
  Footer: typeof ModalFooter;
  Header: typeof ModalHeader;
  Overlay: typeof ModalOverlay;
  Portal: typeof ModalPortal;
  Title: typeof ModalTitle;
  Trigger: typeof ModalTrigger;
};

export const Modal: ModalType = function (props: Dialog.DialogProps) {
  return <Dialog.Root {...props} />;
} as ModalType;

const ModalTrigger = Dialog.Trigger;
const ModalPortal = Dialog.Portal;
const ModalClose = Dialog.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[black]/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = Dialog.Overlay.displayName;

interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  hideCloseButton?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  ModalContentProps
>(({ children, className, hideCloseButton = false, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid max-h-[95dvh] w-[95dvw] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className,
      )}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <ModalClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </ModalClose>
      )}
    </Dialog.Content>
  </ModalPortal>
));
ModalContent.displayName = Dialog.Content.displayName;

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />
);
ModalHeader.displayName = 'ModalHeader';

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse gap-2 sm:flex-row-reverse sm:justify-start', className)}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
ModalTitle.displayName = Dialog.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = Dialog.Description.displayName;

Modal.Trigger = ModalTrigger;
Modal.Portal = ModalPortal;
Modal.Close = ModalClose;
Modal.Overlay = ModalOverlay;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
