export class Cache<T> {
	private cache: Map<string, { value: T; timestamp: number }>;
	private ttl: number;

	constructor(ttl: number = 60) {
		this.cache = new Map<string, { value: T; timestamp: number }>();
		this.ttl = ttl;
	}

	check(key: string): T | undefined {
		const item = this.cache.get(key);
		if (item) {
			const currentTime = Date.now();
			const itemTime = item.timestamp;
			if (currentTime - itemTime > this.ttl * 1000) {
				this.cache.delete(key);
				return undefined;
			}
			return item.value;
		}
		return undefined;
	}

	set(key: string, value: T): void {
		this.cache.set(key, { value, timestamp: Date.now() });
	}
}
