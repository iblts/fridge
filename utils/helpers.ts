export const getNoun = (
	number: number,
	one: string,
	two: string,
	five: string
) => {
	const n = Math.abs(number) % 100
	const n1 = n % 10

	if (n > 10 && n < 20) return five
	if (n1 > 1 && n1 < 5) return two
	if (n1 === 1) return one
	return five
}
