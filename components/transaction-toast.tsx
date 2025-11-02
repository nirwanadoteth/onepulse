import { ReactNode, useEffect, useRef } from "react"
import { useTransactionContext } from "@coinbase/onchainkit/transaction"
import { toast } from "sonner"
import { useChainId } from "wagmi"

import { cn, getChainExplorer } from "@/lib/utils"

function useSafeTransactionContext() {
  try {
    return useTransactionContext()
  } catch {
    return {
      errorMessage: undefined,
      isLoading: false,
      isToastVisible: false,
      receipt: undefined,
      transactionHash: undefined,
      transactionId: undefined,
      onSubmit: undefined,
      chainId: undefined,
      lifecycleStatus: { statusName: "init" },
    } as unknown as ReturnType<typeof useTransactionContext>
  }
}

export function TransactionToast() {
  const context = useSafeTransactionContext()
  const {
    errorMessage,
    isLoading,
    isToastVisible,
    receipt,
    transactionHash,
    transactionId,
    onSubmit,
  } = context

  const accountChainId = useChainId()

  const isInProgress =
    !receipt &&
    !errorMessage &&
    (isLoading || !!transactionId || !!transactionHash)

  const toastCreatedRef = useRef<boolean>(false)
  const toastControllerRef = useRef<{
    resolve?: (value: { name: string }) => void
    reject?: (reason?: unknown) => void
  }>({})
  const txHashRef = useRef<string | undefined>(transactionHash)

  // Update transactionHash ref
  useEffect(() => {
    txHashRef.current = transactionHash
  }, [transactionHash])

  useEffect(() => {
    if (!isToastVisible) {
      if (toastCreatedRef.current && !errorMessage) {
        toast.dismiss()
        toastCreatedRef.current = false
      }
      return
    }

    if (isInProgress && !toastCreatedRef.current) {
      const transactionPromise = new Promise<{ name: string }>(
        (resolve, reject) => {
          toastControllerRef.current.resolve = resolve
          toastControllerRef.current.reject = reject
        }
      )

      toast.promise(transactionPromise, {
        loading: "Processing transaction...",
        success: (data: { name: string }) => {
          const chainExplorer = getChainExplorer(accountChainId)
          let actionElement: ReactNode = null
          if (txHashRef.current) {
            actionElement = (
              <a
                href={`${chainExplorer}/tx/${txHashRef.current}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <span
                  className={cn(
                    "font-ock text-sm font-semibold",
                    "text-ock-primary"
                  )}
                >
                  View transaction
                </span>
              </a>
            )
          }
          return {
            message: `${data.name} successful`,
            action: actionElement,
          }
        },
        error: (error) => {
          const errorMsg =
            error instanceof Error ? error.message : "Something went wrong"
          const actionEl = onSubmit ? (
            <button type="button" onClick={onSubmit} className="ml-auto">
              <span
                className={cn(
                  "font-ock text-sm font-semibold",
                  "text-ock-primary"
                )}
              >
                Try again
              </span>
            </button>
          ) : null
          return {
            message: errorMsg,
            action: actionEl,
          }
        },
      })

      toastCreatedRef.current = true
    }
  }, [isToastVisible, isInProgress, accountChainId, errorMessage, onSubmit])

  useEffect(() => {
    if (!toastCreatedRef.current) {
      return
    }

    if (receipt) {
      toastControllerRef.current.resolve?.({ name: "Transaction" })
      toastCreatedRef.current = false
    } else if (errorMessage) {
      toastControllerRef.current.reject?.(new Error(errorMessage))
      toastCreatedRef.current = false
    }
  }, [receipt, errorMessage])

  return null
}
