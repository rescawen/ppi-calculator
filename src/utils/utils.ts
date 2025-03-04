export const borderClasses: string = "border rounded border-solid border-black"

export const formatNumberWithThousandsSeparator = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
