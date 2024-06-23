import type { Emitter } from "mitt";
import mitt from "mitt";

interface Events {
	"auth:sign-in": null;
	"auth:sign-up": null;
	"auth:verify": null;
	"auth:sign-out": null;
	"auth:reset-password": null;
}

type EventType = keyof Events;

type EventsMap = {
	[K in EventType]: K extends keyof Events ? Events[K] : never;
} & {
	[key: string]: unknown;
	[key: symbol]: unknown;
};

export default defineNuxtPlugin(() => {
	const emitter: Emitter<EventsMap> = mitt<EventsMap>();

	return {
		provide: {
			event: <K extends EventType>(type: K, payload: EventsMap[K]) =>
				emitter.emit(type, payload),
			listen: <K extends EventType>(
				type: K,
				handler: (payload: EventsMap[K]) => void
			) => emitter.on(type, handler),
		},
	};
});
