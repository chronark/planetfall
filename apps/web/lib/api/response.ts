export type ApiResponse<T> =
	| {
			data: T;
			error?: never;
	  }
	| {
			data?: never;
			error: {
				code: string;
				message: string;
			};
	  };
