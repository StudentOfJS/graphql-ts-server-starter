export const logger = (params: any[]) => {
  params.forEach(p => console.log(`${JSON.stringify(p)}`))
}