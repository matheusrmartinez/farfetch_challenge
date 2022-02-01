export interface Doc {
  links: {
    patch: {
      small: string;
      alt: string;
    };
  };
  rocket: string;
  rocket_name: string;
  success: boolean;
  flight_number: number;
  name: string;
  date_utc: string;
  year: number;
  id: string;
}

export interface LaunchesData {
  docs: {
    links: {
      patch: {
        small: string;
        alt: string;
      };
    };
    rocket: string;
    rocket_name: string;
    success: boolean;
    flight_number: number;
    name: string;
    date_utc: string;
    year: number;
    id: string;
  }[];
  hasNextPage: boolean;
}
export interface SelectedIcon {
  flightId: string;
  color: string;
}