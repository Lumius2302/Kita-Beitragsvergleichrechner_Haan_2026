(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KitaTariffs = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  // Unveränderte Zahlen aus der vom Nutzer gelieferten Excel-Datei.
  // Neue Satzung: Centbeträge oberhalb einer Obergrenze wechseln wie bisher in die nächste Stufe.
  return {
  "source": "sources/Elternbeitraege_Neue_und_Alte_Satzung.xlsx",
  "hours": [
    15,
    20,
    25,
    30,
    35,
    40,
    45,
    50
  ],
  "defaultHours": 45,
  "old": {
    "sheet": "Kitabeiträge Alte Satzung",
    "upperBound": "exclusive",
    "brackets": [
      {
        "sourceRow": 8,
        "min": 0,
        "max": 33000,
        "young": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "older": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "ogsFirst": 0,
        "ogsSecond": 0
      },
      {
        "sourceRow": 9,
        "min": 33000,
        "max": 37000,
        "young": [
          28,
          41,
          54,
          64,
          77,
          93,
          106,
          120
        ],
        "older": [
          16,
          23,
          31,
          36,
          44,
          53,
          61,
          68
        ],
        "ogsFirst": 55,
        "ogsSecond": 27.5
      },
      {
        "sourceRow": 10,
        "min": 37000,
        "max": 50000,
        "young": [
          49,
          70,
          92,
          107,
          129,
          156,
          178,
          200
        ],
        "older": [
          28,
          40,
          52,
          61,
          73,
          89,
          102,
          114
        ],
        "ogsFirst": 85,
        "ogsSecond": 42.5
      },
      {
        "sourceRow": 11,
        "min": 50000,
        "max": 62000,
        "young": [
          75,
          107,
          139,
          161,
          193,
          234,
          266,
          298
        ],
        "older": [
          43,
          61,
          79,
          92,
          110,
          134,
          152,
          170
        ],
        "ogsFirst": 110,
        "ogsSecond": 55
      },
      {
        "sourceRow": 12,
        "min": 62000,
        "max": 75000,
        "young": [
          107,
          151,
          195,
          225,
          269,
          327,
          370,
          414
        ],
        "older": [
          61,
          86,
          111,
          128,
          153,
          187,
          212,
          237
        ],
        "ogsFirst": 140,
        "ogsSecond": 70
      },
      {
        "sourceRow": 13,
        "min": 75000,
        "max": 87000,
        "young": [
          145,
          203,
          260,
          299,
          357,
          434,
          491,
          549
        ],
        "older": [
          83,
          116,
          149,
          171,
          204,
          248,
          281,
          314
        ],
        "ogsFirst": 175,
        "ogsSecond": 87.5
      },
      {
        "sourceRow": 14,
        "min": 87000,
        "max": 100000,
        "young": [
          188,
          262,
          335,
          383,
          457,
          555,
          629,
          702
        ],
        "older": [
          108,
          150,
          191,
          219,
          261,
          317,
          359,
          401
        ],
        "ogsFirst": 180,
        "ogsSecond": 90
      },
      {
        "sourceRow": 15,
        "min": 100000,
        "max": null,
        "young": [
          217,
          302,
          386,
          442,
          526,
          640,
          725,
          809
        ],
        "older": [
          124,
          173,
          222,
          253,
          302,
          366,
          415,
          462
        ],
        "ogsFirst": 180,
        "ogsSecond": 90
      }
    ]
  },
  "new": {
    "sheet": "Kitabeiträge Neue Satzung",
    "upperBound": "inclusive",
    "brackets": [
      {
        "sourceRow": 8,
        "min": 0,
        "max": 36000,
        "young": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "older": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "ogsFirst": 0,
        "ogsSecond": 0
      },
      {
        "sourceRow": 9,
        "min": 36001,
        "max": 43000,
        "young": [
          33,
          48,
          63,
          73,
          88,
          107,
          122,
          137
        ],
        "older": [
          22,
          32,
          42,
          49,
          59,
          71,
          82,
          91
        ],
        "ogsFirst": 50,
        "ogsSecond": 25
      },
      {
        "sourceRow": 10,
        "min": 43001,
        "max": 50000,
        "young": [
          42,
          60,
          79,
          92,
          110,
          134,
          153,
          171
        ],
        "older": [
          28,
          40,
          52,
          61,
          73,
          89,
          102,
          114
        ],
        "ogsFirst": 80,
        "ogsSecond": 40
      },
      {
        "sourceRow": 11,
        "min": 50001,
        "max": 56000,
        "young": [
          53,
          76,
          99,
          115,
          138,
          167,
          190,
          213
        ],
        "older": [
          36,
          51,
          66,
          77,
          92,
          112,
          127,
          142
        ],
        "ogsFirst": 100,
        "ogsSecond": 50
      },
      {
        "sourceRow": 12,
        "min": 56001,
        "max": 62000,
        "young": [
          64,
          92,
          119,
          138,
          165,
          201,
          228,
          255
        ],
        "older": [
          43,
          61,
          79,
          92,
          110,
          134,
          152,
          170
        ],
        "ogsFirst": 110,
        "ogsSecond": 55
      },
      {
        "sourceRow": 13,
        "min": 62001,
        "max": 75000,
        "young": [
          92,
          129,
          167,
          193,
          230,
          280,
          317,
          355
        ],
        "older": [
          61,
          86,
          111,
          128,
          153,
          187,
          212,
          237
        ],
        "ogsFirst": 140,
        "ogsSecond": 70
      },
      {
        "sourceRow": 14,
        "min": 75001,
        "max": 87000,
        "young": [
          124,
          174,
          223,
          256,
          306,
          372,
          421,
          471
        ],
        "older": [
          83,
          116,
          149,
          171,
          204,
          248,
          281,
          314
        ],
        "ogsFirst": 170,
        "ogsSecond": 85
      },
      {
        "sourceRow": 15,
        "min": 87001,
        "max": 100000,
        "young": [
          165,
          229,
          293,
          335,
          400,
          485,
          550,
          614
        ],
        "older": [
          110,
          153,
          195,
          223,
          266,
          323,
          366,
          409
        ],
        "ogsFirst": 180,
        "ogsSecond": 90
      },
      {
        "sourceRow": 16,
        "min": 100001,
        "max": 112000,
        "young": [
          190,
          264,
          338,
          387,
          460,
          560,
          634,
          707
        ],
        "older": [
          126,
          176,
          226,
          258,
          308,
          373,
          423,
          471
        ],
        "ogsFirst": 200,
        "ogsSecond": 100
      },
      {
        "sourceRow": 17,
        "min": 112001,
        "max": 125000,
        "young": [
          197,
          275,
          351,
          402,
          479,
          582,
          659,
          735
        ],
        "older": [
          132,
          184,
          235,
          268,
          320,
          388,
          440,
          490
        ],
        "ogsFirst": 200,
        "ogsSecond": 100
      },
      {
        "sourceRow": 18,
        "min": 125001,
        "max": 150000,
        "young": [
          205,
          286,
          366,
          418,
          498,
          605,
          686,
          765
        ],
        "older": [
          137,
          191,
          245,
          279,
          333,
          404,
          458,
          510
        ],
        "ogsFirst": 220,
        "ogsSecond": 110
      },
      {
        "sourceRow": 19,
        "min": 150001,
        "max": 175000,
        "young": [
          213,
          297,
          380,
          435,
          518,
          630,
          713,
          796
        ],
        "older": [
          142,
          198,
          255,
          290,
          347,
          420,
          476,
          530
        ],
        "ogsFirst": 220,
        "ogsSecond": 110
      },
      {
        "sourceRow": 20,
        "min": 175001,
        "max": null,
        "young": [
          222,
          309,
          395,
          452,
          539,
          655,
          742,
          827
        ],
        "older": [
          148,
          206,
          265,
          302,
          360,
          437,
          495,
          551
        ],
        "ogsFirst": 230,
        "ogsSecond": 115
      }
    ]
  }
};
});

