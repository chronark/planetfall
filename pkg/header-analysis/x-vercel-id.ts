export type NetworkHop = {
  regionId: string;
  regionName: string;
  continent: string;
};

const regions: Record<string, { continent: string; regionName: string }> = {
  arn1: { continent: "Europe", regionName: "Stockholm, Sweden" },
  bom1: { continent: "Asia", regionName: "Mumbai, India" },
  bru1: { continent: "Europe", regionName: "Brussels, Belgium" },
  cdg1: { continent: "Europe", regionName: "Paris, France" },
  cle1: { continent: "North America", regionName: "Cleveland, USA" },
  cpt1: { continent: "Africa", regionName: "Cape Town, South Africa" },
  dub1: { continent: "Europe", regionName: "Dublin, Ireland" },
  fra1: { continent: "Europe", regionName: "Frankfurt, Germany" },
  gru1: { continent: "South America", regionName: "São Paulo, Brazil" },
  hkg1: { continent: "Asia", regionName: "Hong Kong" },
  hnd1: { continent: "Asia", regionName: "Tokyo, Japan" },
  iad1: { continent: "North America", regionName: "Washington, D.C., USA" },
  icn1: { continent: "Asia", regionName: "Seoul, South Korea" },
  kix1: { continent: "Asia", regionName: "Osaka, Japan" },
  lhr1: { continent: "Europe", regionName: "London, United Kingdom" },
  pdx1: { continent: "North America", regionName: "Portland, USA" },
  sfo1: { continent: "North America", regionName: "San Francisco, USA" },
  sin1: { continent: "Asia", regionName: "Singapore" },
  syd1: { continent: "Asia", regionName: "Sydney, Australia" },
};
export function parseXVercelId(header: string): NetworkHop[] {
  const re = /([a-z]{3}[0-9])+:+/g;

  const arr = header.match(re);
  if (!arr) {
    return [];
  }

  return arr.map((r) => {
    const regionId = r.replace(/:+/, "");
    return {
      regionId,
      ...regions[regionId],
    };
  });
}
