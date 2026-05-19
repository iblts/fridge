export interface Fridge {
	id: string
	name: string
	creator_id: string
	family_group_id?: string
	food_count: number
}

export interface ProductDirectory {
	foods_id: number
	foods_name: string
	category_id: number | null
	category_name: string | null
	unit_id: number | null
	unit_name: string | null
	unit_symbol: string | null
}

export interface Category {
	id: number
	name: string
	unit_id: number | null
	unit_symbol: string | null
}

export interface Unit {
	id: number
	name: string
	symbol: string
}

export interface Food {
	id: string
	name: string
	quantity: number
	fridge_id: string
	expiration_date?: string
	unit_symbol?: string
}
