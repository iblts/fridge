export interface Fridge {
	id: string
	name: string
	creator_id: string
	family_group_id?: string
}

export interface Food {
	id: string
	name: string
	quantity: number
	fridge_id: string
	expiration_date: string
}
