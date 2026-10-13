export interface ProvinceData {
  name: string;
  nameRw: string;
  districts: {
    name: string;
    sectors: string[];
  }[];
}

export const RWANDA_LOCATIONS: ProvinceData[] = [
  {
    name: "Kigali City",
    nameRw: "Umujyi wa Kigali",
    districts: [
      {
        name: "Gasabo",
        sectors: ["Remera", "Kimironko", "Kacyiru", "Gisozi", "Kagugu", "Ndera", "Bumbogo", "Jabana", "Jali", "Kimihurura", "Nduba", "Rusororo", "Rutunga", "Gatsata", "Kinyinya"]
      },
      {
        name: "Kicukiro",
        sectors: ["Gikondo", "Kanombe", "Kagarama", "Niboye", "Masaka", "Nyarugunga", "Gahanga", "Gatenga", "Kicukiro"]
      },
      {
        name: "Nyarugenge",
        sectors: ["Nyarugenge", "Nyamirambo", "Kigali", "Kimisagara", "Mageragere", "Muhima", "Rwezamenyo", "Gitega"]
      }
    ]
  },
  {
    name: "Northern Province",
    nameRw: "Intara y'Amajyaruguru",
    districts: [
      { name: "Musanze", sectors: ["Muhoza", "Cyuve", "Kinigi", "Busogo", "Gacaca", "Kimonyi", "Musanze", "Nkotsi", "Nyange", "Remera", "Rwaza", "Shingiro"] },
      { name: "Gicumbi", sectors: ["Byumba", "Kaniga", "Miyove", "Kageyo", "Rutare", "Shangasha"] },
      { name: "Rulindo", sectors: ["Tare", "Bushoki", "Buyoga", "Kinihira", "Shyorongi", "Base"] },
      { name: "Burera", sectors: ["Cyeru", "Gahunga", "Kinyababa", "Nemba", "Rugarama"] },
      { name: "Gakenke", sectors: ["Gakenke", "Gashenyi", "Mugunga", "Nemba", "Rushashi"] }
    ]
  },
  {
    name: "Southern Province",
    nameRw: "Intara y'Amajyepfo",
    districts: [
      { name: "Huye", sectors: ["Ngoma", "Tumba", "Mukura", "Kinazi", "Mbazi", "Rwaniro", "Maraba", "Huye", "Gishamvu"] },
      { name: "Muhanga", sectors: ["Nyamabuye", "Cyeza", "Kabacuzi", "Muhanga", "Mushishiro", "Shyogwe"] },
      { name: "Nyanza", sectors: ["Busasamana", "Kibilizi", "Kigoma", "Mukingo", "Muyira", "Ntyazo"] },
      { name: "Ruhango", sectors: ["Ruhango", "Byimana", "Kabagali", "Kinihira", "Mbuye", "Mwendo"] },
      { name: "Kamonyi", sectors: ["Gacurabwenge", "Runda", "Rukoma", "Nyamiyaga", "Kayenzi"] },
      { name: "Nyamagabe", sectors: ["Gasaka", "Kaduha", "Kamegeli", "Kibirizi", "Tare"] },
      { name: "Gisagara", sectors: ["Ndora", "Kigembe", "Mamba", "Muganza", "Save"] },
      { name: "Nyaruguru", sectors: ["Kibeho", "Cyahinda", "Nyabimata", "Ruheru", "Muganza"] }
    ]
  },
  {
    name: "Eastern Province",
    nameRw: "Intara y'Iburasirazuba",
    districts: [
      { name: "Rwamagana", sectors: ["Kigabiro", "Fumbwe", "Gahengeri", "Gishari", "Muhazi", "Mwulire", "Nzige"] },
      { name: "Bugesera", sectors: ["Nyamata", "Gashora", "Juru", "Mayange", "Musenyi", "Rweru"] },
      { name: "Kayonza", sectors: ["Mukarange", "Kabare", "Gahini", "Murama", "Rukara"] },
      { name: "Nyagatare", sectors: ["Nyagatare", "Karangazi", "Matimba", "Mimuri", "Rukomo"] },
      { name: "Gatsibo", sectors: ["Kabarore", "Gatsibo", "Kiziguro", "Muhura", "Rugarama"] },
      { name: "Kirehe", sectors: ["Gatore", "Kigarama", "Kirehe", "Mahama", "Nyamugari"] },
      { name: "Ngoma", sectors: ["Kibungo", "Jarama", "Kazo", "Rukumberi", "Sake"] }
    ]
  },
  {
    name: "Western Province",
    nameRw: "Intara y'Iburengerazuba",
    districts: [
      { name: "Rubavu", sectors: ["Gisenyi", "Kanama", "Mudende", "Nyakiliba", "Rugerero", "Rubavu"] },
      { name: "Rusizi", sectors: ["Kamembe", "Gihundwe", "Bugarama", "Giheke", "Nkanka"] },
      { name: "Karongi", sectors: ["Bwishyura", "Gishyita", "Mubuga", "Rubengera", "Twumba"] },
      { name: "Rutsiro", sectors: ["Gihango", "Kigeyo", "Murunda", "Rusebeya"] },
      { name: "Nyamasheke", sectors: ["Kagano", "Bushekeri", "Kanjongo", "Macuba"] },
      { name: "Nyabihu", sectors: ["Mukamira", "Bigogwe", "Jenda", "Rambura"] },
      { name: "Ngororero", sectors: ["Ngororero", "Bwira", "Kabaya", "Muhororo"] }
    ]
  }
];

export const ALL_DISTRICTS = RWANDA_LOCATIONS.flatMap(p => p.districts.map(d => ({
  district: d.name,
  province: p.name,
  provinceRw: p.nameRw,
  sectors: d.sectors
})));
