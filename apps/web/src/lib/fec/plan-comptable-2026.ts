/* oxlint-disable max-lines */
// Plan de comptes officiel 2026 extrait de Plan-de-comptes-2026.pdf.

export type AccountClass = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type PlanComptableUsage = "minimal" | "facultatif"
export type PlanComptableKind = "class" | "account"

export interface PlanComptableTreeEntry {
  readonly code: string
  readonly label: string
  readonly usage: PlanComptableUsage
  readonly children?: readonly PlanComptableTreeEntry[]
}

export interface PlanComptableEntry {
  readonly code: string
  readonly label: string
  readonly kind: PlanComptableKind
  readonly level: number
  readonly parentCode: string | null
  readonly usage: PlanComptableUsage
}

const PLAN_COMPTABLE_2026_TREE = [
  {
    code: "1",
    label: "COMPTES DE CAPITAUX",
    usage: "minimal",
    children: [
      {
        code: "10",
        label: "Capital et réserves",
        usage: "minimal",
        children: [
          {
            code: "101",
            label: "Capital",
            usage: "minimal",
            children: [
              {
                code: "1011",
                label: "Capital souscrit - non appelé",
                usage: "facultatif",
              },
              {
                code: "1012",
                label: "Capital souscrit - appelé, non versé",
                usage: "facultatif",
              },
              {
                code: "1013",
                label: "Capital souscrit - appelé, versé",
                usage: "facultatif",
                children: [
                  {
                    code: "10131",
                    label: "Capital non amorti",
                    usage: "facultatif",
                  },
                  {
                    code: "10132",
                    label: "Capital amorti",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "1018",
                label:
                  "Capital souscrit soumis à des réglementations particulières",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "102",
            label: "Fonds fiduciaires",
            usage: "facultatif",
          },
          {
            code: "104",
            label: "Primes liées au capital",
            usage: "minimal",
            children: [
              {
                code: "1041",
                label: "Primes d'émission",
                usage: "facultatif",
              },
              {
                code: "1042",
                label: "Primes de fusion",
                usage: "facultatif",
              },
              {
                code: "1043",
                label: "Primes d'apport",
                usage: "facultatif",
              },
              {
                code: "1044",
                label: "Primes de conversion d'obligations en actions",
                usage: "facultatif",
              },
              {
                code: "1045",
                label: "Bons de souscription de titres en capital",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "105",
            label: "Écarts de réévaluation",
            usage: "minimal",
          },
          {
            code: "106",
            label: "Réserves",
            usage: "minimal",
            children: [
              {
                code: "1061",
                label: "Réserve légale",
                usage: "minimal",
              },
              {
                code: "1062",
                label: "Réserves indisponibles",
                usage: "minimal",
              },
              {
                code: "1063",
                label: "Réserves statutaires ou contractuelles",
                usage: "minimal",
              },
              {
                code: "1064",
                label: "Réserves réglementées",
                usage: "minimal",
              },
              {
                code: "1068",
                label: "Autres réserves",
                usage: "minimal",
              },
            ],
          },
          {
            code: "107",
            label: "Écart d'équivalence",
            usage: "minimal",
          },
          {
            code: "108",
            label: "Compte de l'exploitant",
            usage: "minimal",
          },
          {
            code: "109",
            label: "Actionnaires : capital souscrit - non appelé",
            usage: "minimal",
          },
        ],
      },
      {
        code: "11",
        label: "Report à nouveau",
        usage: "minimal",
        children: [
          {
            code: "110",
            label: "Report à nouveau - solde créditeur",
            usage: "minimal",
          },
          {
            code: "119",
            label: "Report à nouveau - solde débiteur",
            usage: "minimal",
          },
        ],
      },
      {
        code: "12",
        label: "Résultat de l'exercice",
        usage: "minimal",
        children: [
          {
            code: "120",
            label: "Résultat de l'exercice - bénéfice",
            usage: "minimal",
            children: [
              {
                code: "1209",
                label: "Acomptes sur dividendes",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "129",
            label: "Résultat de l'exercice – perte",
            usage: "minimal",
          },
        ],
      },
      {
        code: "13",
        label: "Subventions d'investissement",
        usage: "minimal",
        children: [
          {
            code: "131",
            label: "Subventions d'investissement octroyées",
            usage: "minimal",
          },
          {
            code: "139",
            label:
              "Subventions d'investissement inscrites au compte de résultat",
            usage: "minimal",
          },
        ],
      },
      {
        code: "14",
        label: "Provisions réglementées",
        usage: "minimal",
        children: [
          {
            code: "143",
            label: "Provisions réglementées pour hausse de prix",
            usage: "minimal",
          },
          {
            code: "145",
            label: "Amortissements dérogatoires",
            usage: "minimal",
          },
          {
            code: "148",
            label: "Autres provisions réglementées",
            usage: "minimal",
          },
        ],
      },
      {
        code: "15",
        label: "Provisions",
        usage: "minimal",
        children: [
          {
            code: "151",
            label: "Provisions pour risques",
            usage: "minimal",
            children: [
              {
                code: "1511",
                label: "Provisions pour litiges",
                usage: "facultatif",
              },
              {
                code: "1512",
                label: "Provisions pour garanties données aux clients",
                usage: "facultatif",
              },
              {
                code: "1514",
                label: "Provisions pour amendes et pénalités",
                usage: "facultatif",
              },
              {
                code: "1515",
                label: "Provisions pour pertes de change",
                usage: "facultatif",
              },
              {
                code: "1516",
                label: "Provisions pour pertes sur contrats",
                usage: "facultatif",
              },
              {
                code: "1518",
                label: "Autres provisions pour risques",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "152",
            label: "Provisions pour charges",
            usage: "minimal",
            children: [
              {
                code: "1521",
                label: "Provisions pour pensions et obligations similaires",
                usage: "facultatif",
              },
              {
                code: "1522",
                label: "Provisions pour restructurations",
                usage: "facultatif",
              },
              {
                code: "1523",
                label: "Provisions pour impôts",
                usage: "facultatif",
              },
              {
                code: "1524",
                label:
                  "Provisions pour renouvellement des immobilisations - entreprises concessionnaires",
                usage: "facultatif",
              },
              {
                code: "1525",
                label: "Provisions pour gros entretien ou grandes révisions",
                usage: "facultatif",
              },
              {
                code: "1526",
                label: "Provisions pour remise en état",
                usage: "facultatif",
              },
              {
                code: "1527",
                label: "Autres provisions pour charges",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "16",
        label:
          "Emprunts et dettes assimilées, fonds non remboursables et avances conditionnées",
        usage: "minimal",
        children: [
          {
            code: "161",
            label:
              "Emprunts obligataires convertibles si non-inscrits dans le compte 167",
            usage: "minimal",
            children: [
              {
                code: "1618",
                label: "Intérêts courus sur emprunts obligataires convertibles",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "162",
            label:
              "Obligations représentatives de passifs nets remis en fiducie si non-inscrites dans le compte 167",
            usage: "minimal",
          },
          {
            code: "163",
            label:
              "Autres emprunts obligataires si non-inscrits dans le compte 167",
            usage: "minimal",
            children: [
              {
                code: "1638",
                label: "Intérêts courus sur autres emprunts obligataires",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "164",
            label:
              "Emprunts auprès des établissements de crédit si non-inscrits dans le compte 167",
            usage: "minimal",
            children: [
              {
                code: "1648",
                label:
                  "Intérêts courus sur emprunts auprès des établissements de crédit",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "165",
            label: "Dépôts et cautionnements reçus",
            usage: "minimal",
            children: [
              {
                code: "1651",
                label: "Dépôts",
                usage: "facultatif",
              },
              {
                code: "1655",
                label: "Cautionnements",
                usage: "facultatif",
              },
              {
                code: "1658",
                label: "Intérêts courus sur dépôts et cautionnements reçus",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "166",
            label: "Participation des salariés aux résultats",
            usage: "minimal",
            children: [
              {
                code: "1661",
                label: "Comptes bloqués",
                usage: "facultatif",
              },
              {
                code: "1662",
                label: "Fonds de participation",
                usage: "facultatif",
              },
              {
                code: "1668",
                label:
                  "Intérêts courus sur participation des salariés aux résultats",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "167",
            label: "Fonds non remboursables et avances conditionnées",
            usage: "minimal",
            children: [
              {
                code: "1671",
                label: "Fonds non remboursables montant principal",
                usage: "minimal",
                children: [
                  {
                    code: "16711",
                    label: "Titres participatifs montant principal",
                    usage: "facultatif",
                  },
                  {
                    code: "16712",
                    label: "Autres fonds non remboursables montant principal",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "1673",
                label: "Avances conditionnées montant principal",
                usage: "minimal",
              },
              {
                code: "1674",
                label: "Avances conditionnées intérêts courus",
                usage: "minimal",
              },
            ],
          },
          {
            code: "168",
            label: "Autres emprunts et dettes assimilées",
            usage: "minimal",
            children: [
              {
                code: "1681",
                label: "Autres emprunts",
                usage: "facultatif",
              },
              {
                code: "1682",
                label: "Emprunts participatifs",
                usage: "facultatif",
              },
              {
                code: "1685",
                label: "Rentes viagères capitalisées",
                usage: "facultatif",
              },
              {
                code: "1687",
                label: "Autres dettes",
                usage: "facultatif",
              },
              {
                code: "1688",
                label:
                  "Intérêts courus sur autres emprunts et dettes assimilées",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "169",
            label: "Primes de remboursement des emprunts",
            usage: "minimal",
          },
        ],
      },
      {
        code: "17",
        label: "Dettes rattachées à des participations",
        usage: "minimal",
        children: [
          {
            code: "171",
            label: "Dettes rattachées à des participations - groupe",
            usage: "facultatif",
          },
          {
            code: "174",
            label: "Dettes rattachées à des participations - hors groupe",
            usage: "facultatif",
          },
          {
            code: "178",
            label: "Dettes rattachées à des sociétés en participation",
            usage: "facultatif",
          },
        ],
      },
      {
        code: "18",
        label:
          "Comptes de liaison des établissements et sociétés en participation",
        usage: "minimal",
        children: [
          {
            code: "181",
            label: "Comptes de liaison des établissements",
            usage: "facultatif",
          },
          {
            code: "186",
            label:
              "Biens et prestations de services échangés entre établissements - charges",
            usage: "facultatif",
          },
          {
            code: "187",
            label:
              "Biens et prestations de services échangés entre établissements - produits",
            usage: "facultatif",
          },
          {
            code: "188",
            label: "Comptes de liaison des sociétés en participation",
            usage: "facultatif",
          },
        ],
      },
    ],
  },
  {
    code: "2",
    label: "COMPTES D'IMMOBILISATIONS",
    usage: "minimal",
    children: [
      {
        code: "20",
        label: "Immobilisations incorporelles et frais d’établissement",
        usage: "minimal",
        children: [
          {
            code: "201",
            label: "Frais d'établissement",
            usage: "minimal",
            children: [
              {
                code: "2011",
                label: "Frais de constitution",
                usage: "facultatif",
              },
              {
                code: "2012",
                label: "Frais de premier établissement",
                usage: "facultatif",
                children: [
                  {
                    code: "20121",
                    label: "Frais de prospection",
                    usage: "facultatif",
                  },
                  {
                    code: "20122",
                    label: "Frais de publicité",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2013",
                label:
                  "Frais d'augmentation de capital et d'opérations diverses - fusions, scissions, transformations",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "203",
            label: "Frais de développement",
            usage: "minimal",
          },
          {
            code: "205",
            label:
              "Concessions et droits similaires, brevets, licences, marques, procédés, solutions informatiques, droits et valeurs similaires",
            usage: "minimal",
          },
          {
            code: "206",
            label: "Droit au bail",
            usage: "minimal",
          },
          {
            code: "207",
            label: "Fonds commercial",
            usage: "minimal",
          },
          {
            code: "208",
            label: "Autres immobilisations incorporelles",
            usage: "minimal",
            children: [
              {
                code: "2081",
                label: "Mali de fusion sur actifs incorporels",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "21",
        label: "Immobilisations corporelles",
        usage: "minimal",
        children: [
          {
            code: "211",
            label: "Terrains",
            usage: "minimal",
            children: [
              {
                code: "2111",
                label: "Terrains nus",
                usage: "facultatif",
              },
              {
                code: "2112",
                label: "Terrains aménagés",
                usage: "facultatif",
              },
              {
                code: "2113",
                label: "Sous-sols et sur-sols",
                usage: "facultatif",
              },
              {
                code: "2114",
                label: "Terrains de carrières (Tréfonds)",
                usage: "facultatif",
              },
              {
                code: "2115",
                label: "Terrains bâtis",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "212",
            label: "Agencements et aménagements de terrains",
            usage: "minimal",
            children: [
              {
                code: "2121",
                label: "Agencements et aménagements de terrains - Terrains nus",
                usage: "facultatif",
              },
              {
                code: "2122",
                label:
                  "Agencements et aménagements de terrains - Terrains aménagés",
                usage: "facultatif",
              },
              {
                code: "2123",
                label:
                  "Agencements et aménagements de terrains - Sous-sols et sur-sols",
                usage: "facultatif",
              },
              {
                code: "2124",
                label:
                  "Agencements et aménagements de terrains - Terrains de carrières (Tréfonds)",
                usage: "facultatif",
              },
              {
                code: "2125",
                label:
                  "Agencements et aménagements de terrains - Terrains bâtis",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "213",
            label: "Constructions",
            usage: "minimal",
            children: [
              {
                code: "2131",
                label: "Bâtiments",
                usage: "facultatif",
              },
              {
                code: "2135",
                label:
                  "Installations générales - agencements - aménagements des constructions",
                usage: "facultatif",
              },
              {
                code: "2138",
                label: "Ouvrages d'infrastructure",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "214",
            label: "Constructions sur sol d'autrui",
            usage: "minimal",
            children: [
              {
                code: "2141",
                label: "Constructions sur sol d'autrui - Bâtiments",
                usage: "facultatif",
              },
              {
                code: "2145",
                label:
                  "Constructions sur sol d'autrui - Installations générales - agencements - aménagements des constructions",
                usage: "facultatif",
              },
              {
                code: "2148",
                label:
                  "Constructions sur sol d'autrui - Ouvrages d'infrastructure",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "215",
            label:
              "Installations techniques, matériels et outillages industriels",
            usage: "minimal",
            children: [
              {
                code: "2151",
                label: "Installations complexes spécialisées",
                usage: "facultatif",
                children: [
                  {
                    code: "21511",
                    label:
                      "Installations complexes spécialisées sur sol propre",
                    usage: "facultatif",
                  },
                  {
                    code: "21514",
                    label:
                      "Installations complexes spécialisées sur sol d'autrui",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2153",
                label: "Installations à caractère spécifique",
                usage: "facultatif",
                children: [
                  {
                    code: "21531",
                    label:
                      "Installations à caractère spécifique sur sol propre",
                    usage: "facultatif",
                  },
                  {
                    code: "21534",
                    label:
                      "Installations à caractère spécifique sur sol d'autrui",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2154",
                label: "Matériels industriels",
                usage: "facultatif",
              },
              {
                code: "2155",
                label: "Outillages industriels",
                usage: "facultatif",
              },
              {
                code: "2157",
                label:
                  "Agencements et aménagements des matériels et outillages industriels",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "218",
            label: "Autres immobilisations corporelles",
            usage: "minimal",
            children: [
              {
                code: "2181",
                label:
                  "Installations générales, agencements, aménagements divers",
                usage: "facultatif",
              },
              {
                code: "2182",
                label: "Matériel de transport",
                usage: "facultatif",
              },
              {
                code: "2183",
                label: "Matériel de bureau et matériel informatique",
                usage: "facultatif",
              },
              {
                code: "2184",
                label: "Mobilier",
                usage: "facultatif",
              },
              {
                code: "2185",
                label: "Cheptel",
                usage: "facultatif",
              },
              {
                code: "2186",
                label: "Emballages récupérables",
                usage: "facultatif",
              },
              {
                code: "2187",
                label: "Mali de fusion sur actifs corporels",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "22",
        label: "Immobilisations mises en concession",
        usage: "minimal",
        children: [
          {
            code: "229",
            label:
              "Droits du concédant (présentés dans la rubrique autres fonds propres)",
            usage: "minimal",
          },
        ],
      },
      {
        code: "23",
        label: "Immobilisations en cours, avances et acomptes",
        usage: "minimal",
        children: [
          {
            code: "231",
            label: "Immobilisations corporelles en cours",
            usage: "minimal",
          },
          {
            code: "232",
            label: "Immobilisations incorporelles en cours",
            usage: "minimal",
          },
          {
            code: "237",
            label:
              "Avances et acomptes versés sur commandes d'immobilisations incorporelles",
            usage: "minimal",
          },
          {
            code: "238",
            label:
              "Avances et acomptes versés sur commandes d'immobilisations corporelles",
            usage: "minimal",
          },
        ],
      },
      {
        code: "26",
        label: "Participations et créances rattachées à des participations",
        usage: "minimal",
        children: [
          {
            code: "261",
            label: "Titres de participation",
            usage: "minimal",
            children: [
              {
                code: "2611",
                label: "Actions",
                usage: "facultatif",
              },
              {
                code: "2618",
                label: "Autres titres",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "262",
            label: "Titres évalués par équivalence",
            usage: "minimal",
          },
          {
            code: "266",
            label: "Autres formes de participation",
            usage: "minimal",
            children: [
              {
                code: "2661",
                label: "Droits représentatifs d'actifs nets remis en fiducie",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "267",
            label: "Créances rattachées à des participations",
            usage: "minimal",
            children: [
              {
                code: "2671",
                label: "Créances rattachées à des participations - groupe",
                usage: "facultatif",
              },
              {
                code: "2674",
                label: "Créances rattachées à des participations - hors groupe",
                usage: "facultatif",
              },
              {
                code: "2675",
                label:
                  "Versements représentatifs d'apports non capitalisés - appel de fonds",
                usage: "facultatif",
              },
              {
                code: "2676",
                label: "Avances consolidables",
                usage: "facultatif",
              },
              {
                code: "2677",
                label: "Autres créances rattachées à des participations",
                usage: "facultatif",
              },
              {
                code: "2678",
                label: "Intérêts courus",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "268",
            label: "Créances rattachées à des sociétés en participation",
            usage: "minimal",
            children: [
              {
                code: "2681",
                label: "Principal",
                usage: "facultatif",
              },
              {
                code: "2688",
                label: "Intérêts courus",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "269",
            label:
              "Versements restant à effectuer sur titres de participation non libérés",
            usage: "minimal",
          },
        ],
      },
      {
        code: "27",
        label: "Autres immobilisations financières",
        usage: "minimal",
        children: [
          {
            code: "271",
            label:
              "Titres immobilisés autres que les titres immobilisés de l'activité de portefeuille (droit de propriété)",
            usage: "minimal",
            children: [
              {
                code: "2711",
                label: "Actions",
                usage: "facultatif",
              },
              {
                code: "2718",
                label: "Autres titres",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "272",
            label: "Titres immobilisés (droit de créance)",
            usage: "minimal",
            children: [
              {
                code: "2721",
                label: "Obligations",
                usage: "facultatif",
              },
              {
                code: "2722",
                label: "Bons",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "273",
            label: "Titres immobilisés de l'activité de portefeuille",
            usage: "minimal",
          },
          {
            code: "274",
            label: "Prêts",
            usage: "minimal",
            children: [
              {
                code: "2741",
                label: "Prêts participatifs",
                usage: "facultatif",
              },
              {
                code: "2742",
                label: "Prêts aux associés",
                usage: "facultatif",
              },
              {
                code: "2743",
                label: "Prêts au personnel",
                usage: "facultatif",
              },
              {
                code: "2748",
                label: "Autres prêts",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "275",
            label: "Dépôts et cautionnements versés",
            usage: "minimal",
            children: [
              {
                code: "2751",
                label: "Dépôts",
                usage: "facultatif",
              },
              {
                code: "2755",
                label: "Cautionnements",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "276",
            label: "Autres créances immobilisées",
            usage: "minimal",
            children: [
              {
                code: "2761",
                label: "Créances diverses",
                usage: "minimal",
              },
              {
                code: "2768",
                label: "Intérêts courus",
                usage: "minimal",
                children: [
                  {
                    code: "27682",
                    label:
                      "Intérêts courus sur titres immobilisés (droit de créance)",
                    usage: "minimal",
                  },
                  {
                    code: "27684",
                    label: "Intérêts courus sur prêts",
                    usage: "minimal",
                  },
                  {
                    code: "27685",
                    label: "Intérêts courus sur dépôts et cautionnements",
                    usage: "minimal",
                  },
                  {
                    code: "27688",
                    label: "Intérêts courus sur créances diverses",
                    usage: "minimal",
                  },
                ],
              },
            ],
          },
          {
            code: "277",
            label: "Actions propres ou parts propres",
            usage: "minimal",
            children: [
              {
                code: "2771",
                label: "Actions propres ou parts propres",
                usage: "facultatif",
              },
              {
                code: "2772",
                label: "Actions propres ou parts propres en voie d’annulation",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "278",
            label: "Mali de fusion sur actifs financiers",
            usage: "facultatif",
          },
          {
            code: "279",
            label:
              "Versements restant à effectuer sur titres immobilisés non libérés",
            usage: "minimal",
          },
        ],
      },
      {
        code: "28",
        label: "Amortissements des immobilisations",
        usage: "minimal",
        children: [
          {
            code: "280",
            label:
              "Amortissements des immobilisations incorporelles et des frais d’établissement",
            usage: "minimal",
            children: [
              {
                code: "2801",
                label: "Frais d'établissement",
                usage: "minimal",
                children: [
                  {
                    code: "28011",
                    label: "Frais d'établissement - Frais de constitution",
                    usage: "facultatif",
                  },
                  {
                    code: "28012",
                    label:
                      "Frais d'établissement - Frais de premier établissement",
                    usage: "facultatif",
                    children: [
                      {
                        code: "280121",
                        label: "Frais d'établissement - Frais de prospection",
                        usage: "facultatif",
                      },
                      {
                        code: "280122",
                        label: "Frais d'établissement - Frais de publicité",
                        usage: "facultatif",
                      },
                    ],
                  },
                  {
                    code: "28013",
                    label:
                      "Frais d'établissement - Frais d'augmentation de capital et d'opérations diverses - fusions, scissions, transformations",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2803",
                label: "Frais de développement",
                usage: "minimal",
              },
              {
                code: "2805",
                label:
                  "Concessions et droits similaires, brevets, licences, solutions informatiques, droits et valeurs similaires",
                usage: "minimal",
              },
              {
                code: "2806",
                label: "Droit au bail",
                usage: "minimal",
              },
              {
                code: "2807",
                label: "Fonds commercial",
                usage: "minimal",
              },
              {
                code: "2808",
                label: "Autres immobilisations incorporelles",
                usage: "minimal",
                children: [
                  {
                    code: "28081",
                    label:
                      "Amortissements des immobilisations incorporelles et des frais d’établissement - Mali de fusion sur actifs incorporels",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "281",
            label: "Amortissements des immobilisations corporelles",
            usage: "minimal",
            children: [
              {
                code: "2811",
                label:
                  "Amortissements des immobilisations corporelles - Terrains",
                usage: "minimal",
                children: [
                  {
                    code: "28111",
                    label:
                      "Amortissements des immobilisations corporelles - Terrains nus",
                    usage: "facultatif",
                  },
                  {
                    code: "28112",
                    label:
                      "Amortissements des immobilisations corporelles - Terrains aménagés",
                    usage: "facultatif",
                  },
                  {
                    code: "28113",
                    label:
                      "Amortissements des immobilisations corporelles - Sous-sols et sur-sols",
                    usage: "facultatif",
                  },
                  {
                    code: "28114",
                    label:
                      "Amortissements des immobilisations corporelles - Terrains de carrières (Tréfonds)",
                    usage: "facultatif",
                  },
                  {
                    code: "28115",
                    label:
                      "Amortissements des immobilisations corporelles - Terrains bâtis",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2812",
                label: "Agencements, aménagements de terrains",
                usage: "minimal",
                children: [
                  {
                    code: "28121",
                    label:
                      "Agencements, aménagements de terrains - Terrains nus",
                    usage: "facultatif",
                  },
                  {
                    code: "28122",
                    label:
                      "Agencements, aménagements de terrains - Terrains aménagés",
                    usage: "facultatif",
                  },
                  {
                    code: "28123",
                    label:
                      "Agencements, aménagements de terrains - Sous-sols et sur-sols",
                    usage: "facultatif",
                  },
                  {
                    code: "28124",
                    label:
                      "Agencements, aménagements de terrains - Terrains de carrières (Tréfonds)",
                    usage: "facultatif",
                  },
                  {
                    code: "28125",
                    label:
                      "Agencements, aménagements de terrains - Terrains bâtis",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2813",
                label: "Constructions",
                usage: "minimal",
                children: [
                  {
                    code: "28131",
                    label: "Constructions - Bâtiments",
                    usage: "facultatif",
                  },
                  {
                    code: "28135",
                    label:
                      "Constructions - Installations générales - agencements - aménagements des constructions",
                    usage: "facultatif",
                  },
                  {
                    code: "28138",
                    label: "Constructions - Ouvrages d'infrastructure",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2814",
                label: "Constructions sur sol d'autrui",
                usage: "minimal",
                children: [
                  {
                    code: "28141",
                    label: "Constructions sur sol d'autrui - Bâtiments",
                    usage: "facultatif",
                  },
                  {
                    code: "28145",
                    label:
                      "Constructions sur sol d'autrui - Installations générales - agencements - aménagements des constructions",
                    usage: "facultatif",
                  },
                  {
                    code: "28148",
                    label:
                      "Constructions sur sol d'autrui - Ouvrages d'infrastructure",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2815",
                label: "Installations, matériel et outillage industriels",
                usage: "minimal",
                children: [
                  {
                    code: "28151",
                    label:
                      "Installations, matériel et outillage industriels - Installations complexes spécialisées",
                    usage: "facultatif",
                    children: [
                      {
                        code: "281511",
                        label:
                          "Installations, matériel et outillage industriels - Installations complexes spécialisées sur sol propre",
                        usage: "facultatif",
                      },
                      {
                        code: "281514",
                        label:
                          "Installations, matériel et outillage industriels - Installations complexes spécialisées sur sol d'autrui",
                        usage: "facultatif",
                      },
                    ],
                  },
                  {
                    code: "28153",
                    label:
                      "Installations, matériel et outillage industriels - Installations à caractère spécifique",
                    usage: "facultatif",
                    children: [
                      {
                        code: "281531",
                        label:
                          "Installations, matériel et outillage industriels - Installations à caractère spécifique sur sol propre",
                        usage: "facultatif",
                      },
                      {
                        code: "281534",
                        label:
                          "Installations, matériel et outillage industriels - Installations à caractère spécifique sur sol d'autrui",
                        usage: "facultatif",
                      },
                    ],
                  },
                  {
                    code: "28154",
                    label:
                      "Installations, matériel et outillage industriels - Matériels industriels",
                    usage: "facultatif",
                  },
                  {
                    code: "28155",
                    label:
                      "Installations, matériel et outillage industriels - Outillages industriels",
                    usage: "facultatif",
                  },
                  {
                    code: "28157",
                    label:
                      "Installations, matériel et outillage industriels - Agencements et aménagements des matériels et outillages industriels",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2818",
                label: "Autres immobilisations corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "28181",
                    label:
                      "Autres immobilisations corporelles - Installations générales, agencements, aménagements divers",
                    usage: "facultatif",
                  },
                  {
                    code: "28182",
                    label:
                      "Autres immobilisations corporelles - Matériel de transport",
                    usage: "facultatif",
                  },
                  {
                    code: "28183",
                    label:
                      "Autres immobilisations corporelles - Matériel de bureau et matériel informatique",
                    usage: "facultatif",
                  },
                  {
                    code: "28184",
                    label: "Autres immobilisations corporelles - Mobilier",
                    usage: "facultatif",
                  },
                  {
                    code: "28185",
                    label: "Autres immobilisations corporelles - Cheptel",
                    usage: "facultatif",
                  },
                  {
                    code: "28186",
                    label:
                      "Autres immobilisations corporelles - Emballages récupérables",
                    usage: "facultatif",
                  },
                  {
                    code: "28187",
                    label:
                      "Amortissement du mali de fusion sur actifs corporels",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "282",
            label: "Amortissements des immobilisations mises en concession",
            usage: "minimal",
          },
        ],
      },
      {
        code: "29",
        label: "Dépréciations des immobilisations",
        usage: "minimal",
        children: [
          {
            code: "290",
            label: "Dépréciations des immobilisations incorporelles",
            usage: "minimal",
            children: [
              {
                code: "2901",
                label: "Frais d’établissement",
                usage: "minimal",
              },
              {
                code: "2903",
                label: "Frais de développement",
                usage: "minimal",
              },
              {
                code: "2905",
                label: "Marques, procédés, droits et valeurs similaires",
                usage: "minimal",
              },
              {
                code: "2906",
                label: "Droit au bail",
                usage: "minimal",
              },
              {
                code: "2907",
                label: "Fonds commercial",
                usage: "minimal",
              },
              {
                code: "2908",
                label: "Autres immobilisations incorporelles",
                usage: "minimal",
                children: [
                  {
                    code: "29081",
                    label:
                      "Dépréciation du mali de fusion sur actifs incorporels",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "291",
            label: "Dépréciations des immobilisations corporelles",
            usage: "minimal",
            children: [
              {
                code: "2911",
                label: "Terrains",
                usage: "minimal",
              },
              {
                code: "2912",
                label: "Agencements et aménagements de terrains",
                usage: "minimal",
              },
              {
                code: "2913",
                label: "Constructions",
                usage: "minimal",
              },
              {
                code: "2914",
                label: "Constructions sur sol d'autrui",
                usage: "minimal",
              },
              {
                code: "2915",
                label:
                  "Installations techniques, matériels et outillages industriels",
                usage: "minimal",
              },
              {
                code: "2918",
                label: "Autres immobilisations corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "29187",
                    label:
                      "Dépréciation du mali de fusion sur actifs corporels",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "292",
            label: "Dépréciations des immobilisations mises en concession",
            usage: "minimal",
          },
          {
            code: "293",
            label: "Dépréciations des immobilisations en cours",
            usage: "minimal",
            children: [
              {
                code: "2931",
                label: "Immobilisations corporelles en cours",
                usage: "minimal",
              },
              {
                code: "2932",
                label: "Immobilisations incorporelles en cours",
                usage: "minimal",
              },
            ],
          },
          {
            code: "296",
            label:
              "Dépréciations des participations et créances rattachées à des participations",
            usage: "minimal",
            children: [
              {
                code: "2961",
                label: "Titres de participation",
                usage: "minimal",
              },
              {
                code: "2962",
                label: "Titres évalués par équivalence",
                usage: "minimal",
              },
              {
                code: "2966",
                label: "Autres formes de participation",
                usage: "minimal",
              },
              {
                code: "2967",
                label: "Créances rattachées à des participations",
                usage: "minimal",
                children: [
                  {
                    code: "29671",
                    label:
                      "Créances rattachées à des participations - Créances rattachées à des participations - groupe",
                    usage: "facultatif",
                  },
                  {
                    code: "29674",
                    label:
                      "Créances rattachées à des participations - Créances rattachées à des participations - hors groupe",
                    usage: "facultatif",
                  },
                  {
                    code: "29675",
                    label:
                      "Créances rattachées à des participations - Versements représentatifs d'apports non capitalisés - appel de fonds",
                    usage: "facultatif",
                  },
                  {
                    code: "29676",
                    label:
                      "Créances rattachées à des participations - Avances consolidables",
                    usage: "facultatif",
                  },
                  {
                    code: "29677",
                    label:
                      "Créances rattachées à des participations - Autres créances rattachées à des participations",
                    usage: "facultatif",
                  },
                  {
                    code: "29678",
                    label:
                      "Créances rattachées à des participations - Intérêts courus",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "2968",
                label: "Créances rattachées à des sociétés en participation",
                usage: "minimal",
                children: [
                  {
                    code: "29681",
                    label:
                      "Créances rattachées à des sociétés en participation - Principal",
                    usage: "facultatif",
                  },
                  {
                    code: "29688",
                    label:
                      "Créances rattachées à des sociétés en participation - Intérêts courus",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "297",
            label: "Dépréciations des autres immobilisations financières",
            usage: "minimal",
            children: [
              {
                code: "2971",
                label:
                  "Titres immobilisés autres que les titres immobilisés de l'activité de portefeuille (droit de propriété)",
                usage: "minimal",
              },
              {
                code: "2972",
                label: "Titres immobilisés (droit de créance)",
                usage: "minimal",
              },
              {
                code: "2973",
                label: "Titres immobilisés de l'activité de portefeuille",
                usage: "minimal",
              },
              {
                code: "2974",
                label: "Prêts",
                usage: "minimal",
              },
              {
                code: "2975",
                label: "Dépôts et cautionnements versés",
                usage: "minimal",
              },
              {
                code: "2976",
                label: "Autres créances immobilisées",
                usage: "minimal",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "3",
    label: "COMPTES DE STOCKS ET EN-COURS",
    usage: "minimal",
    children: [
      {
        code: "31",
        label: "Matières premières et fournitures",
        usage: "minimal",
      },
      {
        code: "32",
        label: "Autres approvisionnements",
        usage: "minimal",
        children: [
          {
            code: "321",
            label: "Matières consommables",
            usage: "minimal",
          },
          {
            code: "322",
            label: "Fournitures consommables",
            usage: "minimal",
            children: [
              {
                code: "3221",
                label: "Combustibles",
                usage: "facultatif",
              },
              {
                code: "3222",
                label: "Produits d'entretien",
                usage: "facultatif",
              },
              {
                code: "3223",
                label: "Fournitures d'atelier et d'usine",
                usage: "facultatif",
              },
              {
                code: "3224",
                label: "Fournitures de magasin",
                usage: "facultatif",
              },
              {
                code: "3225",
                label: "Fournitures de bureau",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "326",
            label: "Emballages",
            usage: "minimal",
            children: [
              {
                code: "3261",
                label: "Emballages perdus",
                usage: "facultatif",
              },
              {
                code: "3265",
                label: "Emballages récupérables non identifiables",
                usage: "facultatif",
              },
              {
                code: "3267",
                label: "Emballages à usage mixte",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "33",
        label: "En-cours de production de biens",
        usage: "minimal",
        children: [
          {
            code: "331",
            label: "Produits en cours",
            usage: "minimal",
          },
          {
            code: "335",
            label: "Travaux en cours",
            usage: "minimal",
          },
        ],
      },
      {
        code: "34",
        label: "En-cours de production de services",
        usage: "minimal",
        children: [
          {
            code: "341",
            label: "Études en cours",
            usage: "minimal",
          },
          {
            code: "345",
            label: "Prestations de services en cours",
            usage: "minimal",
          },
        ],
      },
      {
        code: "35",
        label: "Stocks de produits",
        usage: "minimal",
        children: [
          {
            code: "351",
            label: "Produits intermédiaires",
            usage: "minimal",
          },
          {
            code: "355",
            label: "Produits finis",
            usage: "minimal",
          },
          {
            code: "358",
            label: "Produits résiduels ou matières de récupération",
            usage: "minimal",
            children: [
              {
                code: "3581",
                label: "Déchets",
                usage: "facultatif",
              },
              {
                code: "3585",
                label: "Rebuts",
                usage: "facultatif",
              },
              {
                code: "3586",
                label: "Matières de récupération",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "36",
        label:
          "(Compte à ouvrir, le cas échéant, sous l'intitulé « Stocks provenant d'immobilisations »)",
        usage: "minimal",
      },
      {
        code: "37",
        label: "Stocks de marchandises",
        usage: "minimal",
      },
      {
        code: "38",
        label:
          "(Le compte 38 peut être utilisé pour comptabiliser les stocks en voie d'acheminement, mis en dépôt ou donnés en consignation)",
        usage: "minimal",
      },
      {
        code: "39",
        label: "Dépréciations des stocks et en-cours",
        usage: "minimal",
        children: [
          {
            code: "391",
            label: "Dépréciations des matières premières et fournitures",
            usage: "minimal",
          },
          {
            code: "392",
            label: "Dépréciations des autres approvisionnements",
            usage: "minimal",
          },
          {
            code: "393",
            label: "Dépréciations des en-cours de production de biens",
            usage: "minimal",
          },
          {
            code: "394",
            label: "Dépréciations des en-cours de production de services",
            usage: "minimal",
          },
          {
            code: "395",
            label: "Dépréciations des stocks de produits",
            usage: "minimal",
          },
          {
            code: "397",
            label: "Dépréciations des stocks de marchandises",
            usage: "minimal",
          },
        ],
      },
    ],
  },
  {
    code: "4",
    label: "COMPTES DE TIERS",
    usage: "minimal",
    children: [
      {
        code: "40",
        label: "Fournisseurs et comptes rattachés",
        usage: "minimal",
        children: [
          {
            code: "401",
            label: "Fournisseurs",
            usage: "minimal",
            children: [
              {
                code: "4011",
                label:
                  "Fournisseurs - Achats de biens et prestations de services",
                usage: "facultatif",
              },
              {
                code: "4017",
                label: "Fournisseurs - Retenues de garantie",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "403",
            label: "Fournisseurs - Effets à payer",
            usage: "minimal",
          },
          {
            code: "404",
            label: "Fournisseurs d'immobilisations",
            usage: "minimal",
            children: [
              {
                code: "4041",
                label: "Fournisseurs - Achats d'immobilisations",
                usage: "facultatif",
              },
              {
                code: "4047",
                label: "Fournisseurs d'immobilisations - Retenues de garantie",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "405",
            label: "Fournisseurs d'immobilisations - Effets à payer",
            usage: "minimal",
          },
          {
            code: "408",
            label: "Fournisseurs - Factures non parvenues",
            usage: "minimal",
            children: [
              {
                code: "4081",
                label: "Fournisseurs",
                usage: "minimal",
              },
              {
                code: "4084",
                label: "Fournisseurs d'immobilisations",
                usage: "minimal",
              },
              {
                code: "4088",
                label: "Fournisseurs - Intérêts courus",
                usage: "minimal",
              },
            ],
          },
          {
            code: "409",
            label: "Fournisseurs débiteurs",
            usage: "minimal",
            children: [
              {
                code: "4091",
                label:
                  "Fournisseurs - Avances et acomptes versés sur commandes",
                usage: "minimal",
              },
              {
                code: "4096",
                label:
                  "Fournisseurs - Créances pour emballages et matériel à rendre",
                usage: "minimal",
              },
              {
                code: "4097",
                label: "Fournisseurs - Autres avoirs",
                usage: "minimal",
                children: [
                  {
                    code: "40971",
                    label: "Fournisseurs d'exploitation",
                    usage: "facultatif",
                  },
                  {
                    code: "40974",
                    label: "Fournisseurs d'immobilisations",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4098",
                label:
                  "Rabais, remises, ristournes à obtenir et autres avoirs non encore reçus",
                usage: "minimal",
              },
            ],
          },
        ],
      },
      {
        code: "41",
        label: "Clients et comptes rattachés",
        usage: "minimal",
        children: [
          {
            code: "411",
            label: "Clients",
            usage: "minimal",
            children: [
              {
                code: "4111",
                label:
                  "Clients - Ventes de biens ou de prestations de services",
                usage: "facultatif",
              },
              {
                code: "4117",
                label: "Clients - Retenues de garantie",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "413",
            label: "Clients - Effets à recevoir",
            usage: "minimal",
          },
          {
            code: "416",
            label: "Clients douteux ou litigieux",
            usage: "minimal",
          },
          {
            code: "418",
            label: "Clients - Produits non encore facturés",
            usage: "minimal",
            children: [
              {
                code: "4181",
                label: "Clients - Factures à établir",
                usage: "facultatif",
              },
              {
                code: "4188",
                label: "Clients - Intérêts courus",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "419",
            label: "Clients créditeurs",
            usage: "minimal",
            children: [
              {
                code: "4191",
                label: "Clients - Avances et acomptes reçus sur commandes",
                usage: "minimal",
              },
              {
                code: "4196",
                label: "Clients - Dettes sur emballages et matériels consignés",
                usage: "minimal",
              },
              {
                code: "4197",
                label: "Clients - Autres avoirs",
                usage: "minimal",
              },
              {
                code: "4198",
                label:
                  "Rabais, remises, ristournes à accorder et autres avoirs à établir",
                usage: "minimal",
              },
            ],
          },
        ],
      },
      {
        code: "42",
        label: "Personnel et comptes rattachés",
        usage: "minimal",
        children: [
          {
            code: "421",
            label: "Personnel - Rémunérations dues",
            usage: "minimal",
          },
          {
            code: "422",
            label: "Comité social et économique",
            usage: "minimal",
          },
          {
            code: "424",
            label: "Participation des salariés aux résultats",
            usage: "minimal",
            children: [
              {
                code: "4246",
                label: "Réserve spéciale",
                usage: "facultatif",
              },
              {
                code: "4248",
                label: "Comptes courants",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "425",
            label:
              "Personnel - Avances et acomptes et autres comptes débiteurs",
            usage: "minimal",
          },
          {
            code: "426",
            label: "Personnel - Dépôts",
            usage: "minimal",
          },
          {
            code: "427",
            label: "Personnel - Oppositions",
            usage: "minimal",
          },
          {
            code: "428",
            label: "Personnel - Charges à payer",
            usage: "minimal",
            children: [
              {
                code: "4282",
                label: "Dettes provisionnées pour congés à payer",
                usage: "facultatif",
              },
              {
                code: "4284",
                label:
                  "Dettes provisionnées pour participation des salariés aux résultats",
                usage: "facultatif",
              },
              {
                code: "4286",
                label: "Autres charges à payer",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "43",
        label: "Sécurité sociale et autres organismes sociaux",
        usage: "minimal",
        children: [
          {
            code: "431",
            label: "Sécurité sociale",
            usage: "minimal",
          },
          {
            code: "437",
            label: "Autres organismes sociaux",
            usage: "minimal",
          },
          {
            code: "438",
            label: "Organismes sociaux - Charges à payer",
            usage: "minimal",
            children: [
              {
                code: "4382",
                label: "Charges sociales sur congés à payer",
                usage: "facultatif",
              },
              {
                code: "4386",
                label: "Autres charges à payer",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "439",
            label: "Organismes sociaux - Produits à recevoir",
            usage: "minimal",
          },
        ],
      },
      {
        code: "44",
        label: "État et autres collectivités publiques",
        usage: "minimal",
        children: [
          {
            code: "441",
            label: "État - Subventions et aides à recevoir",
            usage: "minimal",
          },
          {
            code: "442",
            label:
              "Contributions, impôts et taxes recouvrés pour le compte de l'État",
            usage: "minimal",
            children: [
              {
                code: "4421",
                label: "Prélèvements à la source (Impôt sur le revenu)",
                usage: "facultatif",
              },
              {
                code: "4422",
                label: "Prélèvements forfaitaires non libératoires",
                usage: "facultatif",
              },
              {
                code: "4423",
                label: "Retenues et prélèvements sur les distributions",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "444",
            label: "État - Impôts sur les bénéfices",
            usage: "minimal",
          },
          {
            code: "445",
            label: "État - Taxes sur le chiffre d'affaires",
            usage: "minimal",
            children: [
              {
                code: "4452",
                label: "TVA due intracommunautaire",
                usage: "minimal",
              },
              {
                code: "4455",
                label: "Taxes sur le chiffre d'affaires à décaisser",
                usage: "minimal",
                children: [
                  {
                    code: "44551",
                    label: "TVA à décaisser",
                    usage: "facultatif",
                  },
                  {
                    code: "44558",
                    label: "Taxes assimilées à la TVA",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4456",
                label: "Taxes sur le chiffre d'affaires déductibles",
                usage: "minimal",
                children: [
                  {
                    code: "44562",
                    label: "TVA sur immobilisations",
                    usage: "facultatif",
                  },
                  {
                    code: "44563",
                    label: "TVA transférée par d'autres entités",
                    usage: "facultatif",
                  },
                  {
                    code: "44566",
                    label: "TVA sur autres biens et services",
                    usage: "facultatif",
                  },
                  {
                    code: "44567",
                    label: "Crédit de TVA à reporter",
                    usage: "facultatif",
                  },
                  {
                    code: "44568",
                    label: "Taxes assimilées à la TVA",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4457",
                label: "Taxes sur le chiffre d'affaires collectées",
                usage: "minimal",
                children: [
                  {
                    code: "44571",
                    label: "TVA collectée",
                    usage: "facultatif",
                  },
                  {
                    code: "44578",
                    label: "Taxes assimilées à la TVA",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4458",
                label:
                  "Taxes sur le chiffre d'affaires à régulariser ou en attente",
                usage: "minimal",
                children: [
                  {
                    code: "44581",
                    label: "Acomptes - Régime simplifié d'imposition",
                    usage: "facultatif",
                  },
                  {
                    code: "44583",
                    label:
                      "Remboursement de taxes sur le chiffre d'affaires demandé",
                    usage: "facultatif",
                  },
                  {
                    code: "44584",
                    label: "TVA récupérée d’avance",
                    usage: "facultatif",
                  },
                  {
                    code: "44586",
                    label:
                      "Taxes sur le chiffre d’affaires sur factures non parvenues",
                    usage: "facultatif",
                  },
                  {
                    code: "44587",
                    label:
                      "Taxes sur le chiffre d’affaires sur factures à établir",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "446",
            label: "Obligations cautionnées",
            usage: "minimal",
          },
          {
            code: "447",
            label: "Autres impôts, taxes et versements assimilés",
            usage: "minimal",
          },
          {
            code: "448",
            label: "État - Charges à payer et produits à recevoir",
            usage: "minimal",
            children: [
              {
                code: "4481",
                label: "État - Charges à Payer",
                usage: "minimal",
                children: [
                  {
                    code: "44811",
                    label: "Charges fiscales sur congés à payer",
                    usage: "facultatif",
                  },
                  {
                    code: "44812",
                    label: "Charges à payer",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4482",
                label: "État - Produits à recevoir",
                usage: "minimal",
              },
            ],
          },
          {
            code: "449",
            label: "Quotas d’émission à acquérir",
            usage: "facultatif",
          },
        ],
      },
      {
        code: "45",
        label: "Groupe et associés",
        usage: "minimal",
        children: [
          {
            code: "451",
            label: "Groupe",
            usage: "minimal",
          },
          {
            code: "455",
            label: "Associés - Comptes courants",
            usage: "minimal",
            children: [
              {
                code: "4551",
                label: "Principal",
                usage: "facultatif",
              },
              {
                code: "4558",
                label: "Intérêts courus",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "456",
            label: "Associés - Opérations sur le capital",
            usage: "minimal",
            children: [
              {
                code: "4561",
                label: "Associés - Comptes d'apport en société",
                usage: "facultatif",
                children: [
                  {
                    code: "45611",
                    label: "Apports en nature",
                    usage: "facultatif",
                  },
                  {
                    code: "45615",
                    label: "Apports en numéraire",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4562",
                label: "Apporteurs - Capital appelé, non versé",
                usage: "minimal",
                children: [
                  {
                    code: "45621",
                    label:
                      "Actionnaires - Capital souscrit et appelé, non versé",
                    usage: "facultatif",
                  },
                  {
                    code: "45625",
                    label: "Associés - Capital appelé, non versé",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "4563",
                label:
                  "Associés - Versements reçus sur augmentation de capital",
                usage: "facultatif",
              },
              {
                code: "4564",
                label: "Associés - Versements anticipés",
                usage: "facultatif",
              },
              {
                code: "4566",
                label: "Actionnaires défaillants",
                usage: "facultatif",
              },
              {
                code: "4567",
                label: "Associés - Capital à rembourser",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "457",
            label: "Associés - Dividendes à payer",
            usage: "minimal",
          },
          {
            code: "458",
            label: "Associés - Opérations faites en commun et en GIE",
            usage: "minimal",
            children: [
              {
                code: "4581",
                label: "Opérations courantes",
                usage: "facultatif",
              },
              {
                code: "4588",
                label: "Intérêts courus",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "46",
        label: "Débiteurs divers et créditeurs divers",
        usage: "minimal",
        children: [
          {
            code: "462",
            label: "Créances sur cessions d'immobilisations",
            usage: "minimal",
          },
          {
            code: "464",
            label: "Dettes sur acquisitions de valeurs mobilières de placement",
            usage: "minimal",
          },
          {
            code: "465",
            label: "Créances sur cessions de valeurs mobilières de placement",
            usage: "minimal",
          },
          {
            code: "467",
            label: "Divers comptes débiteurs et produits à recevoir",
            usage: "minimal",
          },
          {
            code: "468",
            label: "Divers comptes créditeurs et charges à payer",
            usage: "minimal",
          },
        ],
      },
      {
        code: "47",
        label: "Comptes transitoires ou d'attente",
        usage: "minimal",
        children: [
          {
            code: "471",
            label: "Comptes d'attente",
            usage: "facultatif",
          },
          {
            code: "472",
            label: "Comptes d'attente",
            usage: "facultatif",
          },
          {
            code: "473",
            label: "Comptes d'attente",
            usage: "facultatif",
          },
          {
            code: "474",
            label: "Différences d’évaluation – Actif",
            usage: "minimal",
            children: [
              {
                code: "4741",
                label:
                  "Différences d'évaluation sur instruments financiers à terme - Actif",
                usage: "facultatif",
              },
              {
                code: "4742",
                label: "Différences d'évaluation sur jetons détenus - Actif",
                usage: "facultatif",
              },
              {
                code: "4746",
                label:
                  "Différences d’évaluation de jetons sur des passifs - Actif",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "475",
            label: "Différences d’évaluation – Passif",
            usage: "minimal",
            children: [
              {
                code: "4751",
                label:
                  "Différences d'évaluation sur instruments financiers à terme - Passif",
                usage: "facultatif",
              },
              {
                code: "4752",
                label: "Différences d'évaluation sur jetons détenus - Passif",
                usage: "facultatif",
              },
              {
                code: "4756",
                label:
                  "Différences d’évaluation de jetons sur des passifs - Passif",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "476",
            label: "Différence de conversion - Actif",
            usage: "minimal",
            children: [
              {
                code: "4761",
                label: "Diminution des créances",
                usage: "facultatif",
              },
              {
                code: "4762",
                label: "Augmentation des dettes",
                usage: "facultatif",
              },
              {
                code: "4768",
                label: "Différences compensées par couverture de change",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "477",
            label: "Différences de conversion - Passif",
            usage: "minimal",
            children: [
              {
                code: "4771",
                label: "Augmentation des créances",
                usage: "facultatif",
              },
              {
                code: "4772",
                label: "Diminution des dettes",
                usage: "facultatif",
              },
              {
                code: "4778",
                label: "Différences compensées par couverture de change",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "478",
            label: "Autres comptes transitoires",
            usage: "minimal",
            children: [
              {
                code: "4781",
                label: "Mali de fusion sur actif circulant",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "48",
        label: "Comptes de régularisation",
        usage: "minimal",
        children: [
          {
            code: "481",
            label: "Frais d’émission des emprunts",
            usage: "minimal",
          },
          {
            code: "486",
            label: "Charges constatées d'avance",
            usage: "minimal",
          },
          {
            code: "487",
            label: "Produits constatés d'avance",
            usage: "minimal",
            children: [
              {
                code: "4871",
                label: "Produits constatés d’avance sur jetons émis",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "488",
            label:
              "Comptes de répartition périodique des charges et des produits",
            usage: "facultatif",
            children: [
              {
                code: "4886",
                label: "Charges",
                usage: "facultatif",
              },
              {
                code: "4887",
                label: "Produits",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "49",
        label: "Dépréciations des comptes de tiers",
        usage: "minimal",
        children: [
          {
            code: "491",
            label: "Dépréciations des comptes de clients",
            usage: "minimal",
          },
          {
            code: "495",
            label: "Dépréciations des comptes du groupe et des associés",
            usage: "minimal",
            children: [
              {
                code: "4951",
                label: "Comptes du groupe",
                usage: "facultatif",
              },
              {
                code: "4955",
                label: "Comptes courants des associés",
                usage: "facultatif",
              },
              {
                code: "4958",
                label: "Opérations faites en commun et en GIE",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "496",
            label: "Dépréciations des comptes de débiteurs divers",
            usage: "minimal",
            children: [
              {
                code: "4962",
                label: "Créances sur cessions d'immobilisations",
                usage: "facultatif",
              },
              {
                code: "4965",
                label:
                  "Créances sur cessions de valeurs mobilières de placement",
                usage: "facultatif",
              },
              {
                code: "4967",
                label: "Autres comptes débiteurs",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "5",
    label: "COMPTES FINANCIERS",
    usage: "minimal",
    children: [
      {
        code: "50",
        label: "Valeurs mobilières de placement",
        usage: "minimal",
        children: [
          {
            code: "502",
            label: "Actions propres",
            usage: "minimal",
            children: [
              {
                code: "5021",
                label:
                  "Actions destinées à être attribuées aux employés et affectées à des plans déterminés",
                usage: "facultatif",
              },
              {
                code: "5022",
                label:
                  "Actions disponibles pour être attribuées aux employés ou pour la régularisation des cours de bourse",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "503",
            label: "Actions",
            usage: "minimal",
            children: [
              {
                code: "5031",
                label: "Titres cotés",
                usage: "facultatif",
              },
              {
                code: "5035",
                label: "Titres non cotés",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "504",
            label: "Autres titres conférant un droit de propriété",
            usage: "minimal",
          },
          {
            code: "505",
            label:
              "Obligations et bons émis par la société et rachetés par elle",
            usage: "minimal",
          },
          {
            code: "506",
            label: "Obligations",
            usage: "minimal",
            children: [
              {
                code: "5061",
                label: "Titres cotés",
                usage: "facultatif",
              },
              {
                code: "5065",
                label: "Titres non cotés",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "507",
            label: "Bons du Trésor et bons de caisse à court terme",
            usage: "minimal",
          },
          {
            code: "508",
            label:
              "Autres valeurs mobilières de placement et autres créances assimilées",
            usage: "minimal",
            children: [
              {
                code: "5081",
                label: "Autres valeurs mobilières",
                usage: "facultatif",
              },
              {
                code: "5082",
                label: "Bons de souscription",
                usage: "facultatif",
              },
              {
                code: "5088",
                label:
                  "Intérêts courus sur obligations, bons et valeurs assimilés",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "509",
            label:
              "Versements restant à effectuer sur valeurs mobilières de placement non libérées",
            usage: "minimal",
          },
        ],
      },
      {
        code: "51",
        label: "Banques, établissements financiers et assimilés",
        usage: "minimal",
        children: [
          {
            code: "511",
            label: "Valeurs à l'encaissement",
            usage: "minimal",
            children: [
              {
                code: "5111",
                label: "Coupons échus à l'encaissement",
                usage: "facultatif",
              },
              {
                code: "5112",
                label: "Chèques à encaisser",
                usage: "facultatif",
              },
              {
                code: "5113",
                label: "Effets à l'encaissement",
                usage: "facultatif",
              },
              {
                code: "5114",
                label: "Effets à l'escompte",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "512",
            label: "Banques",
            usage: "minimal",
            children: [
              {
                code: "5121",
                label: "Comptes en euros",
                usage: "facultatif",
              },
              {
                code: "5124",
                label: "Comptes en devises",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "517",
            label: "Autres organismes financiers",
            usage: "minimal",
          },
          {
            code: "518",
            label: "Intérêts courus",
            usage: "minimal",
            children: [
              {
                code: "5181",
                label: "Intérêts courus à payer",
                usage: "facultatif",
              },
              {
                code: "5188",
                label: "Intérêts courus à recevoir",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "519",
            label: "Concours bancaires courants",
            usage: "minimal",
            children: [
              {
                code: "5191",
                label: "Crédit de mobilisation de créances commerciales",
                usage: "facultatif",
              },
              {
                code: "5193",
                label: "Mobilisation de créances nées à l'étranger",
                usage: "facultatif",
              },
              {
                code: "5198",
                label: "Intérêts courus sur concours bancaires courants",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "52",
        label: "Instruments financiers à terme et jetons détenus",
        usage: "minimal",
        children: [
          {
            code: "521",
            label: "Instruments financiers à terme",
            usage: "minimal",
          },
          {
            code: "522",
            label: "Jetons détenus",
            usage: "minimal",
          },
          {
            code: "523",
            label: "Jetons auto-détenus",
            usage: "minimal",
          },
          {
            code: "524",
            label: "Jetons empruntés",
            usage: "minimal",
          },
        ],
      },
      {
        code: "53",
        label: "Caisse",
        usage: "minimal",
      },
      {
        code: "58",
        label: "Virements internes",
        usage: "minimal",
      },
      {
        code: "59",
        label: "Dépréciations des comptes financiers",
        usage: "minimal",
        children: [
          {
            code: "590",
            label: "Dépréciations des valeurs mobilières de placement",
            usage: "minimal",
            children: [
              {
                code: "5903",
                label: "Actions",
                usage: "facultatif",
              },
              {
                code: "5904",
                label: "Autres titres conférant un droit de propriété",
                usage: "facultatif",
              },
              {
                code: "5906",
                label: "Obligations",
                usage: "facultatif",
              },
              {
                code: "5908",
                label:
                  "Autres valeurs mobilières de placement et créances assimilées",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "6",
    label: "COMPTES DE CHARGES",
    usage: "minimal",
    children: [
      {
        code: "60",
        label: "Achats (sauf 603)",
        usage: "minimal",
        children: [
          {
            code: "601",
            label: "Achats stockés - Matières premières et fournitures",
            usage: "minimal",
          },
          {
            code: "602",
            label: "Achats stockés - Autres approvisionnements",
            usage: "minimal",
            children: [
              {
                code: "6021",
                label: "Matières consommables",
                usage: "facultatif",
              },
              {
                code: "6022",
                label: "Fournitures consommables",
                usage: "facultatif",
                children: [
                  {
                    code: "60221",
                    label: "Combustibles",
                    usage: "facultatif",
                  },
                  {
                    code: "60222",
                    label: "Produits d'entretien",
                    usage: "facultatif",
                  },
                  {
                    code: "60223",
                    label: "Fournitures d'atelier et d'usine",
                    usage: "facultatif",
                  },
                  {
                    code: "60224",
                    label: "Fournitures de magasin",
                    usage: "facultatif",
                  },
                  {
                    code: "60225",
                    label: "Fourniture de bureau",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6026",
                label: "Emballages",
                usage: "facultatif",
                children: [
                  {
                    code: "60261",
                    label: "Emballages perdus",
                    usage: "facultatif",
                  },
                  {
                    code: "60262",
                    label: "Malis sur emballage",
                    usage: "facultatif",
                  },
                  {
                    code: "60265",
                    label: "Emballages récupérables non identifiables",
                    usage: "facultatif",
                  },
                  {
                    code: "60267",
                    label: "Emballages à usage mixte",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "603",
            label:
              "Variation des stocks d'approvisionnements et de marchandises",
            usage: "minimal",
            children: [
              {
                code: "6031",
                label:
                  "Variation des stocks de matières premières et fournitures",
                usage: "minimal",
              },
              {
                code: "6032",
                label: "Variation des stocks des autres approvisionnements",
                usage: "minimal",
              },
              {
                code: "6037",
                label: "Variation des stocks de marchandises",
                usage: "minimal",
              },
            ],
          },
          {
            code: "604",
            label: "Achats d'études et prestations de services",
            usage: "minimal",
          },
          {
            code: "605",
            label: "Achats de matériel, équipements et travaux",
            usage: "minimal",
          },
          {
            code: "606",
            label: "Achats non stockés de matière et fournitures",
            usage: "minimal",
            children: [
              {
                code: "6061",
                label: "Fournitures non stockables (eau, énergie, etc.)",
                usage: "facultatif",
              },
              {
                code: "6063",
                label: "Fournitures d'entretien et de petit équipement",
                usage: "facultatif",
              },
              {
                code: "6064",
                label: "Fournitures administratives",
                usage: "facultatif",
              },
              {
                code: "6068",
                label: "Autres matières et fournitures",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "607",
            label: "Achats de marchandises",
            usage: "minimal",
          },
          {
            code: "608",
            label:
              "(Compte réservé, le cas échéant, au regroupement des frais accessoires incorporés aux achats)",
            usage: "minimal",
          },
          {
            code: "609",
            label: "Rabais, remises et ristournes obtenus sur achats",
            usage: "minimal",
            children: [
              {
                code: "6091",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats stockés - Matières premières et fournitures",
                usage: "minimal",
              },
              {
                code: "6092",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats stockés - Autres approvisionnements",
                usage: "minimal",
                children: [
                  {
                    code: "60921",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Matières consommables",
                    usage: "facultatif",
                  },
                  {
                    code: "60922",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Fournitures consommables",
                    usage: "facultatif",
                    children: [
                      {
                        code: "609221",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Combustibles",
                        usage: "facultatif",
                      },
                      {
                        code: "609222",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Produits d'entretien",
                        usage: "facultatif",
                      },
                      {
                        code: "609223",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Fournitures d'atelier et d'usine",
                        usage: "facultatif",
                      },
                      {
                        code: "609224",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Fournitures de magasin",
                        usage: "facultatif",
                      },
                      {
                        code: "609225",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Fourniture de bureau",
                        usage: "facultatif",
                      },
                    ],
                  },
                  {
                    code: "60926",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Emballages",
                    usage: "facultatif",
                    children: [
                      {
                        code: "609261",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Emballages perdus",
                        usage: "facultatif",
                      },
                      {
                        code: "609262",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Malis sur emballage",
                        usage: "facultatif",
                      },
                      {
                        code: "609265",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Emballages récupérables non identifiables",
                        usage: "facultatif",
                      },
                      {
                        code: "609267",
                        label:
                          "Rabais, remises et ristournes obtenus sur achats - Emballages à usage mixte",
                        usage: "facultatif",
                      },
                    ],
                  },
                ],
              },
              {
                code: "6094",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats d'études et prestations de services",
                usage: "minimal",
              },
              {
                code: "6095",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats de matériel, équipements et travaux",
                usage: "minimal",
              },
              {
                code: "6096",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats non stockés de matière et fournitures",
                usage: "minimal",
                children: [
                  {
                    code: "60961",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Fournitures non stockables (eau, énergie, etc.)",
                    usage: "facultatif",
                  },
                  {
                    code: "60963",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Fournitures d'entretien et de petit équipement",
                    usage: "facultatif",
                  },
                  {
                    code: "60964",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Fournitures administratives",
                    usage: "facultatif",
                  },
                  {
                    code: "60968",
                    label:
                      "Rabais, remises et ristournes obtenus sur achats - Autres matières et fournitures",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6097",
                label:
                  "Rabais, remises et ristournes obtenus sur achats - Achats de marchandises",
                usage: "minimal",
              },
              {
                code: "6098",
                label: "Rabais, remises et ristournes non affectés",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "61",
        label: "Services extérieurs",
        usage: "minimal",
        children: [
          {
            code: "611",
            label: "Sous-traitance générale",
            usage: "minimal",
          },
          {
            code: "612",
            label: "Redevances de crédit-bail",
            usage: "minimal",
            children: [
              {
                code: "6122",
                label: "Crédit-bail mobilier",
                usage: "minimal",
              },
              {
                code: "6125",
                label: "Crédit-bail immobilier",
                usage: "minimal",
              },
            ],
          },
          {
            code: "613",
            label: "Locations",
            usage: "minimal",
            children: [
              {
                code: "6132",
                label: "Locations immobilières",
                usage: "facultatif",
              },
              {
                code: "6135",
                label: "Locations mobilières",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "614",
            label: "Charges locatives et de copropriété",
            usage: "minimal",
          },
          {
            code: "615",
            label: "Entretien et réparation",
            usage: "minimal",
            children: [
              {
                code: "6152",
                label: "Entretien et réparation sur biens immobiliers",
                usage: "facultatif",
              },
              {
                code: "6155",
                label: "Entretien et réparation sur biens mobiliers",
                usage: "facultatif",
              },
              {
                code: "6156",
                label: "Maintenance",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "616",
            label: "Primes d'assurances",
            usage: "minimal",
            children: [
              {
                code: "6161",
                label: "Multirisques",
                usage: "facultatif",
              },
              {
                code: "6162",
                label: "Assurance obligatoire dommage construction",
                usage: "facultatif",
              },
              {
                code: "6163",
                label: "Assurance - transport",
                usage: "facultatif",
                children: [
                  {
                    code: "61636",
                    label: "sur achats",
                    usage: "facultatif",
                  },
                  {
                    code: "61637",
                    label: "sur ventes",
                    usage: "facultatif",
                  },
                  {
                    code: "61638",
                    label: "sur autres biens",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6164",
                label: "Risques d'exploitation",
                usage: "facultatif",
              },
              {
                code: "6165",
                label: "Insolvabilité clients",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "617",
            label: "Études et recherches",
            usage: "minimal",
          },
          {
            code: "618",
            label: "Divers",
            usage: "minimal",
            children: [
              {
                code: "6181",
                label: "Documentation générale",
                usage: "facultatif",
              },
              {
                code: "6183",
                label: "Documentation technique",
                usage: "facultatif",
              },
              {
                code: "6185",
                label: "Frais de colloques, séminaires, conférences",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "619",
            label:
              "Rabais, remises et ristournes obtenus sur services extérieurs",
            usage: "minimal",
          },
        ],
      },
      {
        code: "62",
        label: "Autres services extérieurs",
        usage: "minimal",
        children: [
          {
            code: "621",
            label: "Personnel extérieur à l'entité",
            usage: "minimal",
            children: [
              {
                code: "6211",
                label: "Personnel intérimaire",
                usage: "facultatif",
              },
              {
                code: "6214",
                label: "Personnel détaché ou prêté à l'entité",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "622",
            label: "Rémunérations d'intermédiaires et honoraires",
            usage: "minimal",
            children: [
              {
                code: "6221",
                label: "Commissions et courtages sur achats",
                usage: "facultatif",
              },
              {
                code: "6222",
                label: "Commissions et courtages sur ventes",
                usage: "facultatif",
              },
              {
                code: "6224",
                label: "Rémunérations des transitaires",
                usage: "facultatif",
              },
              {
                code: "6225",
                label: "Rémunérations d'affacturage",
                usage: "facultatif",
              },
              {
                code: "6226",
                label: "Honoraires",
                usage: "facultatif",
              },
              {
                code: "6227",
                label: "Frais d'actes et de contentieux",
                usage: "facultatif",
              },
              {
                code: "6228",
                label: "Divers",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "623",
            label: "Publicité, publications, relations publiques",
            usage: "minimal",
            children: [
              {
                code: "6231",
                label: "Annonces et insertions",
                usage: "facultatif",
              },
              {
                code: "6232",
                label: "Échantillons",
                usage: "facultatif",
              },
              {
                code: "6233",
                label: "Foires et expositions",
                usage: "facultatif",
              },
              {
                code: "6234",
                label: "Cadeaux à la clientèle",
                usage: "facultatif",
              },
              {
                code: "6235",
                label: "Primes",
                usage: "facultatif",
              },
              {
                code: "6236",
                label: "Catalogues et imprimés",
                usage: "facultatif",
              },
              {
                code: "6237",
                label: "Publications",
                usage: "facultatif",
              },
              {
                code: "6238",
                label: "Divers (pourboires, dons courants)",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "624",
            label: "Transports de biens et transports collectifs du personnel",
            usage: "minimal",
            children: [
              {
                code: "6241",
                label: "Transports sur achats",
                usage: "facultatif",
              },
              {
                code: "6242",
                label: "Transports sur ventes",
                usage: "facultatif",
              },
              {
                code: "6243",
                label: "Transports entre établissements ou chantiers",
                usage: "facultatif",
              },
              {
                code: "6244",
                label: "Transports administratifs",
                usage: "facultatif",
              },
              {
                code: "6247",
                label: "Transports collectifs du personnel",
                usage: "facultatif",
              },
              {
                code: "6248",
                label: "Divers",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "625",
            label: "Déplacements, missions et réceptions",
            usage: "minimal",
            children: [
              {
                code: "6251",
                label: "Voyages et déplacements",
                usage: "facultatif",
              },
              {
                code: "6255",
                label: "Frais de déménagement",
                usage: "facultatif",
              },
              {
                code: "6256",
                label: "Missions",
                usage: "facultatif",
              },
              {
                code: "6257",
                label: "Réceptions",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "626",
            label: "Frais postaux et de télécommunications",
            usage: "minimal",
          },
          {
            code: "627",
            label: "Services bancaires et assimilés",
            usage: "minimal",
            children: [
              {
                code: "6271",
                label: "Frais sur titres (achat, vente, garde)",
                usage: "facultatif",
              },
              {
                code: "6272",
                label: "Commissions et frais sur émission d'emprunts",
                usage: "facultatif",
              },
              {
                code: "6275",
                label: "Frais sur effets",
                usage: "facultatif",
              },
              {
                code: "6276",
                label: "Location de coffres",
                usage: "facultatif",
              },
              {
                code: "6278",
                label:
                  "Autres frais et commissions sur prestations de services",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "628",
            label: "Divers",
            usage: "minimal",
            children: [
              {
                code: "6281",
                label: "Concours divers (cotisations)",
                usage: "facultatif",
              },
              {
                code: "6284",
                label: "Frais de recrutement de personnel",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "629",
            label:
              "Rabais, remises et ristournes obtenus sur autres services extérieurs",
            usage: "minimal",
          },
        ],
      },
      {
        code: "63",
        label: "Impôts, taxes et versements assimilés",
        usage: "minimal",
        children: [
          {
            code: "631",
            label:
              "Impôts, taxes et versements assimilés sur rémunérations (administrations des impôts)",
            usage: "minimal",
            children: [
              {
                code: "6311",
                label: "Taxe sur les salaires",
                usage: "facultatif",
              },
              {
                code: "6314",
                label:
                  "Cotisation pour défaut d'investissement obligatoire dans la construction",
                usage: "facultatif",
              },
              {
                code: "6318",
                label: "Autres",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "633",
            label:
              "Impôts, taxes et versements assimilés sur rémunérations (autres organismes)",
            usage: "minimal",
            children: [
              {
                code: "6331",
                label: "Versement de transport",
                usage: "facultatif",
              },
              {
                code: "6332",
                label: "Allocations logement",
                usage: "facultatif",
              },
              {
                code: "6333",
                label:
                  "Contribution unique des employeurs à la formation professionnelle",
                usage: "facultatif",
              },
              {
                code: "6334",
                label:
                  "Participation des employeurs à l'effort de construction",
                usage: "facultatif",
              },
              {
                code: "6335",
                label:
                  "Versements libératoires ouvrant droit à l'exonération de la taxe d'apprentissage",
                usage: "facultatif",
              },
              {
                code: "6338",
                label: "Autres",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "635",
            label:
              "Autres impôts, taxes et versements assimilés (administrations des impôts)",
            usage: "minimal",
            children: [
              {
                code: "6351",
                label: "Impôts directs (sauf impôts sur les bénéfices)",
                usage: "facultatif",
                children: [
                  {
                    code: "63511",
                    label: "Contribution économique territoriale",
                    usage: "facultatif",
                  },
                  {
                    code: "63512",
                    label: "Taxes foncières",
                    usage: "facultatif",
                  },
                  {
                    code: "63513",
                    label: "Autres impôts locaux",
                    usage: "facultatif",
                  },
                  {
                    code: "63514",
                    label: "Taxe sur les véhicules des sociétés",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6352",
                label: "Taxe sur le chiffre d'affaires non récupérables",
                usage: "facultatif",
              },
              {
                code: "6353",
                label: "Impôts indirects",
                usage: "facultatif",
              },
              {
                code: "6354",
                label: "Droits d'enregistrement et de timbre",
                usage: "facultatif",
                children: [
                  {
                    code: "63541",
                    label: "Droits de mutation",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6358",
                label: "Autres droits",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "637",
            label:
              "Autres impôts, taxes et versements assimilés (autres organismes)",
            usage: "minimal",
            children: [
              {
                code: "6371",
                label:
                  "Contribution sociale de solidarité à la charge des sociétés",
                usage: "facultatif",
              },
              {
                code: "6372",
                label:
                  "Taxes perçues par les organismes publics internationaux",
                usage: "facultatif",
              },
              {
                code: "6374",
                label: "Impôts et taxes exigibles à l'étranger",
                usage: "facultatif",
              },
              {
                code: "6378",
                label: "Taxes diverses",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "638",
            label: "Rappel d’impôts (autres qu’impôts sur les bénéfices)",
            usage: "minimal",
          },
        ],
      },
      {
        code: "64",
        label: "Charges de personnel",
        usage: "minimal",
        children: [
          {
            code: "641",
            label: "Rémunérations du personnel",
            usage: "minimal",
            children: [
              {
                code: "6411",
                label: "Salaires, appointements",
                usage: "facultatif",
              },
              {
                code: "6412",
                label: "Congés payés",
                usage: "facultatif",
              },
              {
                code: "6413",
                label: "Primes et gratifications",
                usage: "facultatif",
              },
              {
                code: "6414",
                label: "Indemnités et avantages divers",
                usage: "facultatif",
              },
              {
                code: "6415",
                label: "Supplément familial",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "644",
            label: "Rémunération du travail de l'exploitant",
            usage: "facultatif",
          },
          {
            code: "645",
            label: "Cotisations de sécurité sociale et de prévoyance",
            usage: "minimal",
            children: [
              {
                code: "6451",
                label: "Cotisations à l'Urssaf",
                usage: "facultatif",
              },
              {
                code: "6452",
                label: "Cotisations aux mutuelles",
                usage: "facultatif",
              },
              {
                code: "6453",
                label: "Cotisations aux caisses de retraites",
                usage: "facultatif",
              },
              {
                code: "6454",
                label: "Cotisations à Pôle emploi",
                usage: "facultatif",
              },
              {
                code: "6458",
                label: "Cotisations aux autres organismes sociaux",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "646",
            label: "Cotisations sociales personnelles de l'exploitant",
            usage: "facultatif",
          },
          {
            code: "647",
            label: "Autres cotisations sociales",
            usage: "minimal",
            children: [
              {
                code: "6471",
                label: "Prestations directes",
                usage: "facultatif",
              },
              {
                code: "6472",
                label: "Versements au comité social et économique",
                usage: "facultatif",
              },
              {
                code: "6474",
                label: "Versements aux autres œuvres sociales",
                usage: "facultatif",
              },
              {
                code: "6475",
                label: "Médecine du travail, pharmacie",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "648",
            label: "Autres charges de personnel",
            usage: "minimal",
          },
          {
            code: "649",
            label: "Remboursements de charges de personnel",
            usage: "minimal",
          },
        ],
      },
      {
        code: "65",
        label: "Autres charges de gestion courante",
        usage: "minimal",
        children: [
          {
            code: "651",
            label:
              "Redevances pour concessions, brevets, licences, marques, procédés, solutions informatiques, droits et valeurs similaires",
            usage: "minimal",
            children: [
              {
                code: "6511",
                label:
                  "Redevances pour concessions, brevets, licences, marques, procédés, solutions informatiques",
                usage: "facultatif",
              },
              {
                code: "6516",
                label: "Droits d'auteur et de reproduction",
                usage: "facultatif",
              },
              {
                code: "6518",
                label: "Autres droits et valeurs similaires",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "653",
            label:
              "Rémunérations de l’activité des administrateurs et des gérants",
            usage: "minimal",
          },
          {
            code: "654",
            label: "Pertes sur créances irrécouvrables",
            usage: "minimal",
            children: [
              {
                code: "6541",
                label: "Créances de l'exercice",
                usage: "facultatif",
              },
              {
                code: "6544",
                label: "Créances des exercices antérieurs",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "655",
            label: "Quote-part de résultat sur opérations faites en commun",
            usage: "minimal",
            children: [
              {
                code: "6551",
                label:
                  "Quote-part de bénéfice transférée - comptabilité du gérant",
                usage: "facultatif",
              },
              {
                code: "6555",
                label:
                  "Quote-part de perte supportée - comptabilité des associés non gérants",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "656",
            label: "Pertes de change sur créances et dettes commerciales",
            usage: "minimal",
          },
          {
            code: "657",
            label:
              "Valeurs comptables des immobilisations incorporelles et corporelles cédées",
            usage: "minimal",
          },
          {
            code: "658",
            label: "Pénalités et autres charges",
            usage: "minimal",
            children: [
              {
                code: "6581",
                label:
                  "Pénalités sur marchés (et dédits payés sur achats et ventes)",
                usage: "facultatif",
              },
              {
                code: "6582",
                label: "Pénalités, amendes fiscales et pénales",
                usage: "facultatif",
              },
              {
                code: "6583",
                label: "Malis provenant de clauses d’indexation",
                usage: "facultatif",
              },
              {
                code: "6584",
                label: "Lots",
                usage: "facultatif",
              },
              {
                code: "6588",
                label: "Opérations de constitution ou liquidation des fiducies",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "66",
        label: "Charges financières",
        usage: "minimal",
        children: [
          {
            code: "661",
            label: "Charges d'intérêts",
            usage: "minimal",
            children: [
              {
                code: "6611",
                label: "Intérêts des emprunts et dettes",
                usage: "facultatif",
                children: [
                  {
                    code: "66116",
                    label: "Intérêts des emprunts et dettes assimilées",
                    usage: "facultatif",
                  },
                  {
                    code: "66117",
                    label:
                      "Intérêts des dettes rattachées à des participations",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6612",
                label: "Charges de la fiducie, résultat de la période",
                usage: "facultatif",
              },
              {
                code: "6615",
                label: "Intérêts des comptes courants et des dépôts créditeurs",
                usage: "facultatif",
              },
              {
                code: "6616",
                label:
                  "Intérêts bancaires et sur opérations de financement (escompte…)",
                usage: "facultatif",
              },
              {
                code: "6617",
                label: "Intérêts des obligations cautionnées",
                usage: "facultatif",
              },
              {
                code: "6618",
                label: "Intérêts des autres dettes",
                usage: "facultatif",
                children: [
                  {
                    code: "66181",
                    label: "Intérêts des dettes commerciales",
                    usage: "facultatif",
                  },
                  {
                    code: "66188",
                    label: "Intérêts des dettes diverses",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "664",
            label: "Pertes sur créances liées à des participations",
            usage: "minimal",
          },
          {
            code: "665",
            label: "Escomptes accordés",
            usage: "minimal",
          },
          {
            code: "666",
            label: "Pertes de change financières",
            usage: "minimal",
          },
          {
            code: "667",
            label: "Charges sur cession d’éléments financiers",
            usage: "minimal",
            children: [
              {
                code: "6671",
                label:
                  "Valeurs comptables des immobilisations financières cédées",
                usage: "minimal",
              },
              {
                code: "6672",
                label:
                  "Charges nettes sur cessions de titres immobilisés de l’activité de portefeuille",
                usage: "minimal",
              },
              {
                code: "6673",
                label:
                  "Charges nettes sur cessions de valeurs mobilières de placement",
                usage: "minimal",
              },
              {
                code: "6674",
                label: "Charges nettes sur cessions de jetons",
                usage: "minimal",
              },
            ],
          },
          {
            code: "668",
            label: "Autres charges financières",
            usage: "minimal",
            children: [
              {
                code: "6683",
                label:
                  "Mali provenant du rachat par l’entité d’actions et obligations émises par elle-même",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "67",
        label: "Charges exceptionnelles",
        usage: "minimal",
        children: [
          {
            code: "672",
            label:
              "(Compte à la disposition des entités pour enregistrer, en cours d'exercice, les charges sur exercices antérieurs)",
            usage: "minimal",
          },
          {
            code: "678",
            label: "Autres charges exceptionnelles",
            usage: "minimal",
          },
        ],
      },
      {
        code: "68",
        label:
          "Dotations aux amortissements, aux dépréciations et aux provisions",
        usage: "minimal",
        children: [
          {
            code: "681",
            label:
              "Dotations aux amortissements, aux dépréciations et aux provisions (à inscrire dans les charges d'exploitation)",
            usage: "minimal",
            children: [
              {
                code: "6811",
                label:
                  "Dotations aux amortissements sur immobilisations incorporelles et corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "68111",
                    label:
                      "Immobilisations incorporelles et frais d’établissement",
                    usage: "facultatif",
                  },
                  {
                    code: "68112",
                    label: "Immobilisations corporelles",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6815",
                label: "Dotations aux provisions d'exploitation",
                usage: "minimal",
              },
              {
                code: "6816",
                label:
                  "Dotations pour dépréciations des immobilisations incorporelles et corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "68161",
                    label: "Immobilisations incorporelles",
                    usage: "facultatif",
                  },
                  {
                    code: "68162",
                    label: "Immobilisations corporelles",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6817",
                label: "Dotations pour dépréciations des actifs circulants",
                usage: "minimal",
                children: [
                  {
                    code: "68173",
                    label: "Stocks et en-cours",
                    usage: "facultatif",
                  },
                  {
                    code: "68174",
                    label: "Créances",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "686",
            label:
              "Dotations aux amortissements, aux dépréciations et aux provisions (à inscrire dans les charges financières)",
            usage: "minimal",
            children: [
              {
                code: "6861",
                label:
                  "Dotations aux amortissements des primes de remboursement des emprunts",
                usage: "minimal",
              },
              {
                code: "6862",
                label:
                  "Dotations aux amortissements des frais d'émission des emprunts",
                usage: "minimal",
              },
              {
                code: "6865",
                label: "Dotations aux provisions financières",
                usage: "minimal",
              },
              {
                code: "6866",
                label: "Dotations pour dépréciation des éléments financiers",
                usage: "minimal",
                children: [
                  {
                    code: "68662",
                    label: "Immobilisations financières",
                    usage: "facultatif",
                  },
                  {
                    code: "68665",
                    label: "Valeurs mobilières de placement",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "687",
            label:
              "Dotations aux amortissements, aux dépréciations et aux provisions (à inscrire dans les charges exceptionnelles)",
            usage: "minimal",
            children: [
              {
                code: "6871",
                label:
                  "Dotations aux amortissements exceptionnels des immobilisations",
                usage: "minimal",
              },
              {
                code: "6872",
                label:
                  "Dotations aux provisions réglementées (immobilisations)",
                usage: "minimal",
                children: [
                  {
                    code: "68725",
                    label: "Amortissements dérogatoires",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "6873",
                label: "Dotations aux provisions réglementées (stocks)",
                usage: "minimal",
              },
              {
                code: "6874",
                label: "Dotations aux autres provisions réglementées",
                usage: "minimal",
              },
              {
                code: "6875",
                label: "Dotations aux provisions exceptionnelles",
                usage: "minimal",
              },
              {
                code: "6876",
                label: "Dotations pour dépréciations exceptionnelles",
                usage: "minimal",
              },
            ],
          },
        ],
      },
      {
        code: "69",
        label:
          "Participation des salariés - Impôts sur les bénéfices et assimilés",
        usage: "minimal",
        children: [
          {
            code: "691",
            label: "Participation des salariés aux résultats",
            usage: "minimal",
          },
          {
            code: "695",
            label: "Impôts sur les bénéfices",
            usage: "minimal",
            children: [
              {
                code: "6951",
                label: "Impôts dus en France",
                usage: "facultatif",
              },
              {
                code: "6952",
                label: "Contribution additionnelle à l'impôt sur les bénéfices",
                usage: "facultatif",
              },
              {
                code: "6954",
                label: "Impôts dus à l'étranger",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "696",
            label:
              "Suppléments d'impôt sur les sociétés liés aux distributions",
            usage: "minimal",
          },
          {
            code: "698",
            label: "Intégration fiscale",
            usage: "minimal",
            children: [
              {
                code: "6981",
                label: "Intégration fiscale - Charges",
                usage: "minimal",
              },
              {
                code: "6989",
                label: "Intégration fiscale - Produits",
                usage: "minimal",
              },
            ],
          },
          {
            code: "699",
            label: "Produits - Reports en arrière des déficits",
            usage: "minimal",
          },
        ],
      },
    ],
  },
  {
    code: "7",
    label: "COMPTES DE PRODUITS",
    usage: "minimal",
    children: [
      {
        code: "70",
        label:
          "Ventes de produits fabriqués, prestations de services, marchandises",
        usage: "minimal",
        children: [
          {
            code: "701",
            label: "Ventes de produits finis",
            usage: "minimal",
          },
          {
            code: "702",
            label: "Ventes de produits intermédiaires",
            usage: "minimal",
          },
          {
            code: "703",
            label: "Ventes de produits résiduels",
            usage: "minimal",
          },
          {
            code: "704",
            label: "Travaux",
            usage: "minimal",
          },
          {
            code: "705",
            label: "Études",
            usage: "minimal",
          },
          {
            code: "706",
            label: "Prestations de services",
            usage: "minimal",
          },
          {
            code: "707",
            label: "Ventes de marchandises",
            usage: "minimal",
          },
          {
            code: "708",
            label: "Produits des activités annexes",
            usage: "minimal",
            children: [
              {
                code: "7081",
                label:
                  "Produits des services exploités dans l'intérêt du personnel",
                usage: "facultatif",
              },
              {
                code: "7082",
                label: "Commissions et courtages",
                usage: "facultatif",
              },
              {
                code: "7083",
                label: "Locations diverses",
                usage: "facultatif",
              },
              {
                code: "7084",
                label: "Mise à disposition de personnel facturée",
                usage: "facultatif",
              },
              {
                code: "7085",
                label: "Ports et frais accessoires facturés",
                usage: "facultatif",
              },
              {
                code: "7086",
                label: "Bonis sur reprises d'emballages consignés",
                usage: "facultatif",
              },
              {
                code: "7087",
                label:
                  "Bonifications obtenues des clients et primes sur ventes",
                usage: "facultatif",
              },
              {
                code: "7088",
                label:
                  "Autres produits d'activités annexes (cessions d'approvisionnements)",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "709",
            label: "Rabais, remises et ristournes accordés",
            usage: "minimal",
            children: [
              {
                code: "7091",
                label:
                  "Rabais, remises et ristournes accordés sur ventes de produits finis",
                usage: "minimal",
              },
              {
                code: "7092",
                label:
                  "Rabais, remises et ristournes accordés sur ventes de produits intermédiaires",
                usage: "minimal",
              },
              {
                code: "7094",
                label: "Rabais, remises et ristournes accordés sur travaux",
                usage: "minimal",
              },
              {
                code: "7095",
                label: "Rabais, remises et ristournes accordés sur études",
                usage: "minimal",
              },
              {
                code: "7096",
                label:
                  "Rabais, remises et ristournes accordés sur prestations de services",
                usage: "minimal",
              },
              {
                code: "7097",
                label:
                  "Rabais, remises et ristournes accordés sur ventes de marchandises",
                usage: "minimal",
              },
              {
                code: "7098",
                label:
                  "Rabais, remises et ristournes accordés sur produits des activités annexes",
                usage: "minimal",
              },
            ],
          },
        ],
      },
      {
        code: "71",
        label: "Production stockée (ou déstockage)",
        usage: "minimal",
        children: [
          {
            code: "713",
            label:
              "Variation des stocks des en-cours de production et de produits",
            usage: "minimal",
            children: [
              {
                code: "7133",
                label: "Variation des en-cours de production de biens",
                usage: "minimal",
                children: [
                  {
                    code: "71331",
                    label: "Produits en cours",
                    usage: "facultatif",
                  },
                  {
                    code: "71335",
                    label: "Travaux en cours",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "7134",
                label: "Variation des en-cours de production de services",
                usage: "minimal",
                children: [
                  {
                    code: "71341",
                    label: "Études en cours",
                    usage: "facultatif",
                  },
                  {
                    code: "71345",
                    label: "Prestations de services en cours",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "7135",
                label: "Variation des stocks de produits",
                usage: "minimal",
                children: [
                  {
                    code: "71351",
                    label: "Produits intermédiaires",
                    usage: "facultatif",
                  },
                  {
                    code: "71355",
                    label: "Produits finis",
                    usage: "facultatif",
                  },
                  {
                    code: "71358",
                    label: "Produits résiduels",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        code: "72",
        label: "Production immobilisée",
        usage: "minimal",
        children: [
          {
            code: "721",
            label: "Immobilisations incorporelles",
            usage: "minimal",
          },
          {
            code: "722",
            label: "Immobilisations corporelles",
            usage: "minimal",
          },
        ],
      },
      {
        code: "74",
        label: "Subventions",
        usage: "minimal",
        children: [
          {
            code: "741",
            label: "Subventions d’exploitation",
            usage: "minimal",
          },
          {
            code: "742",
            label: "Subventions d’équilibre",
            usage: "minimal",
          },
          {
            code: "747",
            label:
              "Quote-part des subventions d’investissement virée au résultat de l’exercice",
            usage: "minimal",
          },
        ],
      },
      {
        code: "75",
        label: "Autres produits de gestion courante",
        usage: "minimal",
        children: [
          {
            code: "751",
            label:
              "Redevances pour concessions, brevets, licences, marques, procédés, solutions informatiques, droits et valeurs similaires",
            usage: "minimal",
            children: [
              {
                code: "7511",
                label:
                  "Redevances pour concessions, brevets, licences, marques, procédés, solutions informatiques",
                usage: "facultatif",
              },
              {
                code: "7516",
                label: "Droits d'auteur et de reproduction",
                usage: "facultatif",
              },
              {
                code: "7518",
                label: "Autres droits et valeurs similaires",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "752",
            label:
              "Revenus des immeubles non affectés à des activités professionnelles",
            usage: "minimal",
          },
          {
            code: "753",
            label:
              "Rémunérations de l’activité des administrateurs et des gérants",
            usage: "minimal",
          },
          {
            code: "754",
            label:
              "Ristournes perçues des coopératives provenant des excédents",
            usage: "minimal",
          },
          {
            code: "755",
            label: "Quote-part de résultat sur opérations faites en commun",
            usage: "minimal",
            children: [
              {
                code: "7551",
                label:
                  "Quote-part de perte transférée - comptabilité du gérant",
                usage: "facultatif",
              },
              {
                code: "7555",
                label:
                  "Quote-part de bénéfice attribuée - comptabilité des associés non-gérants",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "756",
            label: "Gains de change sur créances et dettes commerciales",
            usage: "minimal",
          },
          {
            code: "757",
            label:
              "Produits des cessions d’immobilisations incorporelles et corporelles",
            usage: "minimal",
          },
          {
            code: "758",
            label: "Indemnités et autres produits",
            usage: "minimal",
            children: [
              {
                code: "7581",
                label: "Dédits et pénalités perçus sur achats et ventes",
                usage: "facultatif",
              },
              {
                code: "7582",
                label: "Libéralités reçues",
                usage: "facultatif",
              },
              {
                code: "7583",
                label: "Rentrées sur créances amorties",
                usage: "facultatif",
              },
              {
                code: "7584",
                label:
                  "Dégrèvements d’impôts autres qu’impôts sur les bénéfices",
                usage: "facultatif",
              },
              {
                code: "7585",
                label: "Bonis provenant de clauses d’indexation",
                usage: "facultatif",
              },
              {
                code: "7586",
                label: "Lots",
                usage: "facultatif",
              },
              {
                code: "7587",
                label: "Indemnités d’assurance",
                usage: "facultatif",
              },
              {
                code: "7588",
                label: "Opérations de constitution ou liquidation des fiducies",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "76",
        label: "Produits financiers",
        usage: "minimal",
        children: [
          {
            code: "761",
            label: "Produits de participations",
            usage: "minimal",
            children: [
              {
                code: "7611",
                label: "Revenus des titres de participation",
                usage: "facultatif",
              },
              {
                code: "7612",
                label: "Produits de la fiducie, résultat de la période",
                usage: "facultatif",
              },
              {
                code: "7616",
                label: "Revenus sur autres formes de participation",
                usage: "facultatif",
              },
              {
                code: "7617",
                label: "Revenus des créances rattachées à des participations",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "762",
            label: "Produits des autres immobilisations financières",
            usage: "minimal",
            children: [
              {
                code: "7621",
                label: "Revenus des titres immobilisés",
                usage: "facultatif",
              },
              {
                code: "7626",
                label: "Revenus des prêts",
                usage: "facultatif",
              },
              {
                code: "7627",
                label: "Revenus des créances immobilisées",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "763",
            label: "Revenus des autres créances",
            usage: "minimal",
            children: [
              {
                code: "7631",
                label: "Revenus des créances commerciales",
                usage: "facultatif",
              },
              {
                code: "7638",
                label: "Revenus des créances diverses",
                usage: "facultatif",
              },
            ],
          },
          {
            code: "764",
            label: "Revenus des valeurs mobilières de placement",
            usage: "minimal",
          },
          {
            code: "765",
            label: "Escomptes obtenus",
            usage: "minimal",
          },
          {
            code: "766",
            label: "Gains de change financiers",
            usage: "minimal",
          },
          {
            code: "767",
            label: "Produits sur cession d’éléments financiers",
            usage: "minimal",
            children: [
              {
                code: "7671",
                label: "Produits des cessions d’immobilisations financières",
                usage: "minimal",
              },
              {
                code: "7672",
                label:
                  "Produits nets sur cessions de titres immobilisés de l’activité de portefeuille",
                usage: "minimal",
              },
              {
                code: "7673",
                label:
                  "Produits nets sur cessions de valeurs mobilières de placement",
                usage: "minimal",
              },
              {
                code: "7674",
                label: "Produits nets sur cessions de jetons",
                usage: "minimal",
              },
            ],
          },
          {
            code: "768",
            label: "Autres produits financiers",
            usage: "minimal",
            children: [
              {
                code: "7683",
                label:
                  "Bonis provenant du rachat par l’entreprise d’actions et d’obligations émises par elle-même",
                usage: "facultatif",
              },
            ],
          },
        ],
      },
      {
        code: "77",
        label: "Produits exceptionnels",
        usage: "minimal",
        children: [
          {
            code: "772",
            label:
              "(Compte à la disposition des entités pour enregistrer, en cours d'exercice, les produits sur exercices antérieurs)",
            usage: "minimal",
          },
          {
            code: "778",
            label: "Autres produits exceptionnels",
            usage: "minimal",
          },
        ],
      },
      {
        code: "78",
        label: "Reprises sur amortissements, dépréciations et provisions",
        usage: "minimal",
        children: [
          {
            code: "781",
            label:
              "Reprises sur amortissements, dépréciations et provisions (à inscrire dans les produits d'exploitation)",
            usage: "minimal",
            children: [
              {
                code: "7811",
                label:
                  "Reprises sur amortissements des immobilisations incorporelles et corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "78111",
                    label: "Immobilisations incorporelles",
                    usage: "facultatif",
                  },
                  {
                    code: "78112",
                    label: "Immobilisations corporelles",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "7815",
                label: "Reprises sur provisions d'exploitation",
                usage: "minimal",
              },
              {
                code: "7816",
                label:
                  "Reprises sur dépréciations des immobilisations incorporelles et corporelles",
                usage: "minimal",
                children: [
                  {
                    code: "78161",
                    label: "Immobilisations incorporelles",
                    usage: "facultatif",
                  },
                  {
                    code: "78162",
                    label: "Immobilisations corporelles",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "7817",
                label: "Reprises sur dépréciations des actifs circulants",
                usage: "minimal",
                children: [
                  {
                    code: "78173",
                    label: "Stocks et en-cours",
                    usage: "facultatif",
                  },
                  {
                    code: "78174",
                    label: "Créances",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "786",
            label:
              "Reprises sur dépréciations et provisions (à inscrire dans les produits financiers)",
            usage: "minimal",
            children: [
              {
                code: "7865",
                label: "Reprises sur provisions financières",
                usage: "minimal",
              },
              {
                code: "7866",
                label: "Reprises sur dépréciations des éléments financiers",
                usage: "minimal",
                children: [
                  {
                    code: "78662",
                    label: "Immobilisations financières",
                    usage: "facultatif",
                  },
                  {
                    code: "78665",
                    label: "Valeurs mobilières de placement",
                    usage: "facultatif",
                  },
                ],
              },
            ],
          },
          {
            code: "787",
            label:
              "Reprises sur dépréciations et provisions (à inscrire dans les produits exceptionnels)",
            usage: "minimal",
            children: [
              {
                code: "7872",
                label: "Reprises sur provisions réglementées (immobilisations)",
                usage: "minimal",
                children: [
                  {
                    code: "78725",
                    label: "Amortissements dérogatoires",
                    usage: "facultatif",
                  },
                ],
              },
              {
                code: "7873",
                label: "Reprises sur provisions réglementées (stocks)",
                usage: "minimal",
              },
              {
                code: "7874",
                label: "Reprises sur autres provisions réglementées",
                usage: "minimal",
              },
              {
                code: "7875",
                label: "Reprises sur provisions exceptionnelles",
                usage: "minimal",
              },
              {
                code: "7876",
                label: "Reprises sur dépréciations exceptionnelles",
                usage: "minimal",
              },
            ],
          },
        ],
      },
    ],
  },
] as const satisfies readonly PlanComptableTreeEntry[]

function flattenPlanComptableEntries(
  entries: readonly PlanComptableTreeEntry[],
  parentCode: string | null = null
): PlanComptableEntry[] {
  const flattened: PlanComptableEntry[] = []

  for (const entry of entries) {
    flattened.push({
      code: entry.code,
      label: entry.label,
      kind: entry.code.length === 1 ? "class" : "account",
      level: entry.code.length,
      parentCode,
      usage: entry.usage,
    })
    if (entry.children)
      flattened.push(...flattenPlanComptableEntries(entry.children, entry.code))
  }

  return flattened
}

export const PLAN_COMPTABLE_2026: readonly PlanComptableEntry[] =
  flattenPlanComptableEntries(PLAN_COMPTABLE_2026_TREE)

const PLAN_COMPTABLE_BY_CODE: ReadonlyMap<string, PlanComptableEntry> = new Map(
  PLAN_COMPTABLE_2026.map((entry) => [entry.code, entry])
)

export function resolvePlanComptableEntry(
  compteNum: string
): PlanComptableEntry | null {
  const trimmed = compteNum.trim()
  for (let length = trimmed.length; length >= 1; length--) {
    const candidate = trimmed.slice(0, length)
    const entry = PLAN_COMPTABLE_BY_CODE.get(candidate)
    if (entry) return entry
  }
  return null
}

function isPlanComptableCode(code: string): boolean {
  return PLAN_COMPTABLE_BY_CODE.has(code.trim())
}

export function getPlanComptableClass(compteNum: string): AccountClass | null {
  const entry = resolvePlanComptableEntry(compteNum)
  const first = entry?.code[0]
  if (!first) return null
  const value = Number(first)
  if (isAccountClass(value)) return value
  return null
}

function isAccountClass(value: number): value is AccountClass {
  return Number.isInteger(value) && value >= 1 && value <= 7
}

export function isPlanComptableAccountUnder(
  compteNum: string,
  officialCode: string
): boolean {
  if (!isPlanComptableCode(officialCode)) return false
  const entry = resolvePlanComptableEntry(compteNum)
  return entry
    ? entry.code === officialCode || entry.code.startsWith(officialCode)
    : false
}

export function isPlanComptableAccountUnderAny(
  compteNum: string,
  officialCodes: readonly string[]
): boolean {
  return officialCodes.some((code) =>
    isPlanComptableAccountUnder(compteNum, code)
  )
}
