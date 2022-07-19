import { dlopen, FFIType, ptr } from 'bun:ffi'
import { encode, toString } from './utils'

const location = new URL(`../release/${process.platform}-${process.arch}`, import.meta.url).pathname
export const { symbols } = dlopen(location, {
  CreateSelection: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.int],
    returns: FFIType.ptr
  },
  FreeString: {
    args: [FFIType.ptr],
    returns: FFIType.void
  }
})

export type SelectionItem = {
  text: string
  description?: string
}

export type SelectionOptions = {
  perPage?: number
  headerText?: string
}

export type SelectionReturn = {
  selectedIndex: number | null
  error: string | null
}

export function createSelection(items: SelectionItem[], options: SelectionOptions = {
  perPage: 5,
  headerText: 'Select an item: '
}): SelectionReturn {
  const stringifiedItems = JSON.stringify(items.map((item) => {
    return {
      text: item.text,
      description: item.description || ''
    }
  }))
  const returnedPtr = symbols.CreateSelection(
    ptr(encode(stringifiedItems)),
    ptr(encode(options.headerText)),
    options.perPage
  )
  const { selectedIndex, error } = JSON.parse(toString(returnedPtr)) as {
    selectedIndex: string
    error: string
  }
  if (error !== "") {
    return {
      selectedIndex: null,
      error
    }
  }
  return {
    selectedIndex: Number(selectedIndex),
    error: null
  }
}