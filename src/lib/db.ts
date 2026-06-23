import type {
  Booking,
  BookingStatus,
  Hospital,
  Hotel,
  Interpreter,
  User,
  Vehicle,
} from "./types";
import {
  hospitalsSeed,
  hotelsSeed,
  interpretersSeed,
  usersSeed,
  vehiclesSeed,
} from "./seed";

const KEYS = {
  hospitals: "mk_hospitals",
  interpreters: "mk_interpreters",
  hotels: "mk_hotels",
  vehicles: "mk_vehicles",
  bookings: "mk_bookings",
  users: "mk_users",
  session: "mk_session",
  seeded: "mk_seeded_v3",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function seedIfEmpty() {
  if (localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.hospitals, hospitalsSeed);
  write(KEYS.interpreters, interpretersSeed);
  write(KEYS.hotels, hotelsSeed);
  write(KEYS.vehicles, vehiclesSeed);
  write(KEYS.bookings, []);
  write(KEYS.users, usersSeed);
  localStorage.removeItem(KEYS.session);
  localStorage.setItem(KEYS.seeded, "1");
}

export const db = {
  // ─── Hospitals ───
  hospitals: {
    list(): Hospital[] {
      return read<Hospital[]>(KEYS.hospitals, []);
    },
    get(id: string): Hospital | undefined {
      return this.list().find((h) => h.id === id);
    },
    save(h: Hospital) {
      const all = this.list();
      const idx = all.findIndex((x) => x.id === h.id);
      if (idx >= 0) all[idx] = h;
      else all.push(h);
      write(KEYS.hospitals, all);
    },
    create(data: Omit<Hospital, "id">): Hospital {
      const h: Hospital = { ...data, id: uid("h_") };
      write(KEYS.hospitals, [...this.list(), h]);
      return h;
    },
    remove(id: string) {
      write(KEYS.hospitals, this.list().filter((h) => h.id !== id));
    },
  },

  // ─── Interpreters ───
  interpreters: {
    list(): Interpreter[] {
      return read<Interpreter[]>(KEYS.interpreters, []);
    },
    get(id: string) {
      return this.list().find((i) => i.id === id);
    },
    save(item: Interpreter) {
      const all = this.list();
      const idx = all.findIndex((x) => x.id === item.id);
      if (idx >= 0) all[idx] = item;
      else all.push(item);
      write(KEYS.interpreters, all);
    },
    create(data: Omit<Interpreter, "id">): Interpreter {
      const item: Interpreter = { ...data, id: uid("i_") };
      write(KEYS.interpreters, [...this.list(), item]);
      return item;
    },
    remove(id: string) {
      write(KEYS.interpreters, this.list().filter((i) => i.id !== id));
    },
  },

  // ─── Hotels ───
  hotels: {
    list(): Hotel[] {
      return read<Hotel[]>(KEYS.hotels, []);
    },
    get(id: string) {
      return this.list().find((h) => h.id === id);
    },
    save(item: Hotel) {
      const all = this.list();
      const idx = all.findIndex((x) => x.id === item.id);
      if (idx >= 0) all[idx] = item;
      else all.push(item);
      write(KEYS.hotels, all);
    },
    create(data: Omit<Hotel, "id">): Hotel {
      const item: Hotel = { ...data, id: uid("ht_") };
      write(KEYS.hotels, [...this.list(), item]);
      return item;
    },
    remove(id: string) {
      write(KEYS.hotels, this.list().filter((h) => h.id !== id));
    },
  },

  // ─── Vehicles ───
  vehicles: {
    list(): Vehicle[] {
      return read<Vehicle[]>(KEYS.vehicles, []);
    },
    get(id: string) {
      return this.list().find((v) => v.id === id);
    },
    save(item: Vehicle) {
      const all = this.list();
      const idx = all.findIndex((x) => x.id === item.id);
      if (idx >= 0) all[idx] = item;
      else all.push(item);
      write(KEYS.vehicles, all);
    },
    create(data: Omit<Vehicle, "id">): Vehicle {
      const item: Vehicle = { ...data, id: uid("v_") };
      write(KEYS.vehicles, [...this.list(), item]);
      return item;
    },
    remove(id: string) {
      write(KEYS.vehicles, this.list().filter((v) => v.id !== id));
    },
  },

  // ─── Bookings ───
  bookings: {
    list(): Booking[] {
      return read<Booking[]>(KEYS.bookings, []);
    },
    create(b: Omit<Booking, "id" | "createdAt" | "status">): Booking {
      const booking: Booking = {
        ...b,
        id: uid("bk_"),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      write(KEYS.bookings, [booking, ...this.list()]);
      return booking;
    },
    updateStatus(id: string, status: BookingStatus) {
      write(KEYS.bookings, this.list().map((b) => (b.id === id ? { ...b, status } : b)));
    },
    cancel(id: string) {
      this.updateStatus(id, "cancelled");
    },
    remove(id: string) {
      write(KEYS.bookings, this.list().filter((b) => b.id !== id));
    },
  },

  // ─── Users ───
  users: {
    list(): User[] {
      return read<User[]>(KEYS.users, []);
    },
    get(id: string) {
      return this.list().find((u) => u.id === id);
    },
    findByEmail(email: string) {
      return this.list().find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    create(input: { email: string; password: string; name: string; country: string }): User | { error: string } {
      if (this.findByEmail(input.email)) return { error: "Email already registered" };
      const user: User = {
        id: uid("u_"),
        email: input.email,
        password: input.password,
        name: input.name,
        country: input.country,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      write(KEYS.users, [...this.list(), user]);
      return user;
    },
    update(user: User) {
      write(KEYS.users, this.list().map((u) => (u.id === user.id ? user : u)));
    },
    remove(id: string) {
      write(KEYS.users, this.list().filter((u) => u.id !== id));
    },
  },

  // ─── Auth ───
  auth: {
    login(email: string, password: string): User | { error: string } {
      const user = db.users.findByEmail(email);
      if (!user) return { error: "No account found with that email" };
      if (user.password !== password) return { error: "Incorrect password" };
      localStorage.setItem(KEYS.session, user.id);
      return user;
    },
    logout() {
      localStorage.removeItem(KEYS.session);
    },
    current(): User | undefined {
      const id = localStorage.getItem(KEYS.session);
      if (!id) return undefined;
      return db.users.list().find((u) => u.id === id);
    },
  },
};
