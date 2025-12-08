import dbConnect from '../../lib/dbConnect'
import Product from '../../models/Product'

const productsCSV = `23082,Fragancias,Star Glow Cologne,Lily Bloom,450.00
23083,Fragancias,Star Glow Cologne,Peach Sorbet,450.00
23084,Fragancias,Star Glow Cologne,Vanilla Crush,450.00
21063,Cuerpo,Crema Corporal Ed. Limitada,Cardamomo y Bergamota,301.00
23087,Cuerpo,Gel de Baño Ed. Limitada,Cardamomo y Bergamota,252.00
61065,Fragancias,Alizéa Agua de Perfume,,490.00
01922,Fragancias,Notes Exotiques Parfum (Caballero),Mandarine Italienne,1140.00
01921,Fragancias,Notes Exotiques Parfum (Caballero),Gaïac Extravagant,1140.00
01923,Fragancias,Notes Exotiques Parfum (Dama),Rose Du Maroc,1140.00
01924,Fragancias,Notes Exotiques Parfum (Dama),Éclat D'Ylang,1140.00
21057,Cuerpo,Mua Mua Cherry Blossom Crema Corporal,,322.00
61048,Fragancias,Mua Mua Cherry Blossom Agua de Perfume,,339.50
51006,Fragancias,Refinato Agua de Perfume,,667.50
21060,Cuerpo,Crema Corporal Antioxidantes,,322.50
27088,Cuerpo,Exfoliante Corporal Antioxidantes,,322.50
23080,Cuerpo,Gel de Baño Antioxidantes,,270.00
23085,Cuerpo,Colonia Corporal Antioxidantes,Berry Burst,322.50
01925,Rostro,Set Imperial Flower (Loción + Cápsulas),,1262.00
11013,Rostro,Skin Cell Defense Concentrado Puro,,652.50
11012,Rostro,Activskin Gel Facial Hidratante,,562.50
13013,Rostro,Summer Glow Agua Micelar,,231.00
15004,Rostro,Summer Glow Aceite Humectante,,266.00
19008,Rostro,Summer Glow Suero Iluminador,,266.00
13014,Rostro,Summer Glow Gel Crema Hidratante,,266.00
19011,Rostro,Summer Glow Suero Bronceador,,259.00
01926,Rostro,Cellular Strength System (Día + Noche),,1085.50
13003,Ojos,Gel para Contorno de Ojos,,660.00
11006,Ojos,Synergex Crema Contorno de Ojos,,700.00
01927,Ojos,Set Cuidado de Ojos (Gel + Crema Synergex),,952.00
43001,Ojos,Lápiz Delineador para Cejas,Brownie,119.00
44008,Ojos,Pincel Indeleble para Ojos,Black,175.00
39005,Ojos,Spectacular Lengthening Máscara,,224.00
42008,Ojos,Lápiz Delineador 3 en 1,Neutral,119.00
43003,Ojos,Lápiz Delineador 3 en 1,Café,119.00
39007,Ojos,Cellular Lash System Loción Pestañas,,546.00
41014,Rostro,Corrector Hidratante Máxima Cobertura,Light Cool,187.50
41013,Rostro,Corrector Hidratante Máxima Cobertura,Light Warm,187.50
41016,Rostro,Corrector Hidratante Máxima Cobertura,Neutral,187.50
41017,Rostro,Corrector Hidratante Máxima Cobertura,Dark,187.50
41015,Rostro,Corrector Hidratante Máxima Cobertura,Medium Cool,187.50
36026,Rostro,Maquillaje Protector FPS 15 Células Madre,Creamy Beige,311.50
36025,Rostro,Maquillaje Protector FPS 15 Células Madre,Nude,311.50
36027,Rostro,Maquillaje Protector FPS 15 Células Madre,Honey,311.50
36028,Rostro,Maquillaje Protector FPS 15 Células Madre,Classic Beige,311.50
36029,Rostro,Maquillaje Protector FPS 15 Células Madre,Monaco,311.50
36024,Rostro,Maquillaje Protector FPS 15 Células Madre,Ivory,311.50
36030,Rostro,Maquillaje Protector FPS 15 Células Madre,Butter Cream,311.50
36044,Rostro,Maquillaje Protector FPS 15 Células Madre,Mahogany,311.50
33033,Labios,Labial Líquido Larga Duración,Red,227.50
33037,Labios,Labial Líquido Larga Duración,Orange,227.50
33035,Labios,Labial Líquido Larga Duración,Nude,227.50
33034,Labios,Labial Líquido Larga Duración,Walnut,227.50
33036,Labios,Labial Líquido Larga Duración,Pink,227.50
33046,Labios,Labial Líquido Larga Duración,Rose,227.50
33047,Labios,Labial Líquido Larga Duración,Crushed Berry,227.50
33048,Labios,Labial Líquido Larga Duración,Lilac,227.50
33049,Labios,Labial Líquido Larga Duración,Rosebud,227.50
18007,Labios,Exfoliante para Labios,,236.00
11016,Labios,Bálsamo para Labios FPS 15,,146.00
46005,Rostro,Polvo Facial Translúcido,Glow,371.00
16002,Rostro,Polvo Mineral Facial FPS 20,,540.00
32078,Uñas,Esmalte para Uñas,Tan Red,150.00
32080,Uñas,Esmalte para Uñas,White,150.00
32074,Uñas,Esmalte para Uñas,Neutral Rose,150.00
32077,Uñas,Esmalte para Uñas,Pure Red,150.00
32076,Uñas,Esmalte para Uñas,Neutral Beige,150.00
32075,Uñas,Esmalte para Uñas,Girly Rose,150.00
32082,Uñas,Esmalte para Uñas,Magenta,150.00
32083,Uñas,Esmalte para Uñas,So Pink,150.00
32081,Uñas,Esmalte para Uñas,Purple Wine,150.00
32079,Uñas,Esmalte para Uñas,Tender Coral,150.00
21009,Cuerpo,Crema Corporal Grosella Lirio y Geranio,,301.00
23054,Cuerpo,Gel de Baño Grosella Lirio y Geranio,,252.00
27037,Rostro/Cuerpo,Vitaóleo Tratamiento Aceites Naturales,,555.00
28003,Cuerpo,Desodorante Aclarador Perla,,300.00
28004,Cuerpo,Desodorante Masculino Limón,,300.00
25007,Cabello,Bruma Capilar Relajante,,270.00
27067,Cabello,Aceite 3 en 1 (Jumbo 195ml),,468.00
25008,Cabello,Acondicionador Sin Enjuague Células Madre,,375.00
27054,Cabello,Exfoliante Capilar,,412.50
27046,Cabello,Suero Concentrado Puntas Maltratadas,,333.50
29001,Higiene Intima,Spray Desodorante Íntimo (50+),,157.50
29003,Higiene Intima,Gel Limpiador Íntimo (50+),,183.50
29006,Higiene Intima,Spray Desodorante Íntimo (Periodo),,157.50
29007,Higiene Intima,Gel Limpiador Íntimo (Periodo),,183.50
29002,Higiene Intima,Spray Desodorante Íntimo (Regular),,157.50
29004,Higiene Intima,Gel Limpiador Íntimo (Regular),,183.50
91154,Cabello,Shampoo Matizador (Causa Social),,197.50
11001,Rostro,Crema Limpiadora Facial Hidratante,,370.00
16001,Rostro,Polvo Micro-Exfoliante,,630.00
13007,Rostro,Agua Micelar Glaciar,,370.00
13002,Rostro,Gel Limpiador Facial Control Grasa,,370.00
14001,Rostro,Tónico Hidratante,,370.00
14002,Rostro,Tónico Facial Control Grasa,,370.00
12005,Rostro,Spray Facial Refrescante,,370.00
13011,Rostro,Leche Limpiadora Pieles Intolerantes,,370.00
18002,Rostro,Gel Exfoliante Doble Acción,,430.00
18003,Rostro,Mascarilla Carbón Activado,,430.00
18001,Rostro,Oil Antidote Mascarilla Poros,,370.00
11005,Rostro,Oil Antidote Crema Correctora,,370.00
17002,Rostro,Oil Antidote Matificante,,520.00
15001,Rostro,Aceite Facial,,630.00
15007,Rostro,Suero Oleoso Vitamina C,,630.00
19005,Rostro,Time Freeze Suero ADN Marino,,1150.00
19007,Rostro,Hydragenics Cápsulas Ceramidas,,1300.00
12008,Rostro,Totally Radiant Plus Loción Aclaradora,,820.00
13001,Rostro,Beyond Lift Gel Rostro y Cuello,,870.00
12012,Rostro,Imperial Flower Loción Facial,,805.00
19012,Rostro,Imperial Flower Cápsulas Faciales,,680.00
17004,Rostro,Fresh Mango Cells Filler,,770.00
18008,Rostro,Gel Facial Exfoliante Peeling,,780.00
19010,Rostro,Terra D'Or Gel Facial Concentrado,,1150.00
18009,Rostro,Terra D'Or Mascarilla Peel Off,,600.00
21040,Rostro,Synergex Tratamiento Cuello,,1020.00
47002,Rostro,CC Cream FPS 20,Light,460.00
47000,Rostro,CC Cream FPS 20,Medium,460.00
11017,Rostro,Activskin Crema Pieles Intolerantes,,800.00
11004,Rostro,Crema Hidratante Noche,,800.00
18010,Ojos,Synergex Parches Desinflamantes,,465.00
11007,Rostro,Activskin Crema Hidratante FPS 15,,750.00
12003,Rostro,Activskin Loción Hidratante FPS 15,,750.00
12004,Rostro,Activskin Loción Matificante FPS 15,,750.00
21028,Manos,Bamboo Rescue Exfoliante Nocturno,,400.00
21027,Manos,Bamboo Rescue Bálsamo Nocturno,,420.00
21001,Cuerpo,SLM Science Crema Alisante,,790.00
21013,Cuerpo,Night SLM Science Gel Nocturno,,790.00
21004,Pies,Gel Humectante Pies,,320.00
27005,Pies,Sales Marinas Exfoliantes Pies,,430.00
12009,Rostro,Protector Facial Ultra Ligero FPS 50+,,440.00
12007,Cuerpo,Inside & Out Spray Solar FPS 50+,,540.00
11010,Rostro,Crema Facial Protección Solar FPS 50+,,640.00
12011,Rostro,Terranature Protector Ecológico FPS 50+,,640.00
16003,Rostro,Terranature Barra Solar FPS 50+,,440.00
28001,Cuerpo,Desodorante Tropical Fantasy,,200.00
28002,Cuerpo,Desodorante Aqua Marine,,200.00
28006,Cuerpo,Desodorante Cedar Delish,,200.00
28005,Cuerpo,Desodorante Rose Eden,,200.00
11020,Rostro,Summer Glow Mascarilla Labios Kiwi,,290.00
11019,Rostro,Summer Glow Mascarilla Labios Mango,,290.00
13016,Rostro,Summer Glow Espuma Limpiadora,,485.00
13017,Rostro,Summer Glow Gel Equilibrante,,415.00
19014,Rostro,Summer Glow Suero Control Grasa,,380.00
11022,Rostro,Summer Glow Barra Imperfecciones,,325.00
33081,Labios,Star Glow Brillo Labial (Coco),Cute,300.00
33079,Labios,Star Glow Brillo Labial (Moras),Cool,300.00
33077,Labios,Star Glow Brillo Labial (Mango Durazno),Fresh,300.00
33078,Labios,Star Glow Brillo Labial (Chocolate),Natural,300.00
33080,Labios,Star Glow Brillo Labial (Manzana),Sexy,300.00
38030,Rostro,Star Glow Rubor en Crema,Pinky Peach,615.00
38031,Rostro,Star Glow Rubor en Crema,Bronzed Red,615.00
38032,Rostro,Star Glow Rubor en Crema,Pink Lady,615.00
38033,Rostro,Star Glow Rubor en Polvo,Pinky Peach,615.00
38035,Rostro,Star Glow Rubor en Polvo,Pink Lady,615.00
38034,Rostro,Star Glow Rubor en Polvo,Bronzed Red,615.00
41009,Rostro,Star Glow Corrector Iluminador,Soft Rose,350.00
41011,Rostro,Star Glow Corrector Iluminador,Cold Beige,350.00
41012,Rostro,Star Glow Corrector Iluminador,Soft Tan,350.00
41008,Rostro,Star Glow Corrector Iluminador,Neutral,350.00
41010,Rostro,Star Glow Corrector Iluminador,Warm Nude,350.00
29008,Cuerpo,Stretch Science Aceite Gel,,580.00
21000,Cuerpo,Crema Corporal Almendras,,430.00
23000,Cuerpo,Gel de Baño Almendras,,360.00
21002,Manos,Crema Manos Coco Limón,,205.00
27000,Cuerpo,Exfoliante Corporal Coco Limón,,430.00
21003,Cuerpo,Crema Corporal Cítricos,,430.00
23001,Cuerpo,Gel de Baño Coco Limón,,360.00
27006,Cuerpo,Aceite Masaje Canela,,440.00
27087,Cuerpo,Bálsamo Muscular Árnica,,445.00
21006,Cuerpo,Crema Mantequillas (Codos/Rodillas),,280.00
23028,Cuerpo,Gel de Baño Mantequillas,,360.00
21018,Cuerpo,Crema Corporal Mantequillas,,430.00
27047,Cuerpo,Exfoliante Mantequillas,,430.00
21061,Cuerpo,Terranature Emulsión Piernas,,600.00
29010,Higiene Intima,Homme Secrets Gel Limpiador,,285.00
27066,Cabello,Aceite 3 en 1 (98 ml),,340.00
27001,Cabello,Aceite 3 en 1 (120 ml),,580.00
27008,Cabello,Shampoo Óleos,,360.00
27065,Cabello,Mascarilla Intensiva,,405.00
25003,Cabello,Shampoo Matizador Rubio,,395.00
25006,Cabello,Acondicionador Matizador Cobrizo,,500.00
25002,Cabello,Spray Bifásico,,500.00
27086,Cabello,Crema para Peinar Hialurónico,,500.00
27072,Cabello,Aceite Protector Color (98 ml),,380.00
27009,Cabello,Aceite Protector Color (120 ml),,630.00
27052,Cabello,Acondicionador Seda y Leche,,360.00
27077,Cabello,Shampoo Anticaspa,,600.00
27033,Cabello,Loción Cuero Cabelludo (Ampolletas),,315.00
27057,Cabello,Suero Protector Termal,,330.00
27056,Cabello,Shampoo Cabello Rizado,,440.00
27064,Cabello,Acondicionador Cabello Rizado,,440.00
27043,Cabello,Crema Moldear Rizos,,460.00
25004,Cabello,Shampoo Anticaída,,440.00
27014,Cabello,Tratamiento Anticaída,,910.00
23056,Cabello,Gel Anticaída,,350.00
15002,Barber,Aceite Pre-Afeitado,,520.00
11014,Barber,Crema para Afeitar,,470.00
11015,Barber,Bálsamo After Shave,,420.00
25005,Barber,Cera Modeladora,,330.00
32071,Uñas,Tratamiento Endurecedor,,210.00
32073,Uñas,Base Fortalecedora,,210.00
32072,Uñas,Brillo Efecto Gel,,210.00
32031,Uñas,Aceite Cutícula,,220.00
13005,Rostro,Gel Desmaquillante Ojos/Labios,,230.00
13006,Rostro,Loción Desmaquillante Bifásica,,350.00
48000,Rostro,Maquillaje Mousse,Light,545.00
48001,Rostro,Maquillaje Mousse,Medium,545.00
48002,Rostro,Maquillaje Mousse,Dark,545.00
48003,Rostro,Maquillaje Mousse,Medium Light,545.00
36038,Rostro,Maquillaje Longwear Waterproof,Porcelain,420.00
36040,Rostro,Maquillaje Longwear Waterproof,Chesnut,420.00
36041,Rostro,Maquillaje Longwear Waterproof,Palerose,420.00
36039,Rostro,Maquillaje Longwear Waterproof,Vainilla,420.00
47001,Rostro,Base y Protector Facial FPS 50,,405.00
38025,Rostro,Perfilador en Barra,Light,290.00
38026,Rostro,Perfilador en Barra,Medium,290.00
38027,Rostro,Perfilador en Barra,Dark,290.00
37012,Rostro,Corrector en Barra,Porcelain,290.00
37015,Rostro,Corrector en Barra,Neutral,290.00
37014,Rostro,Corrector en Barra,Vainilla,290.00
44012,Rostro,Iluminador Facial en Barra,,305.00
41005,Rostro,Corrector Ojos,Light,200.00
41006,Rostro,Corrector Ojos,Medium Light,200.00
41004,Rostro,Corrector Ojos,Medium,200.00
38016,Rostro,Perfilador Mini,,455.00
37016,Rostro,Maquillaje Compacto,Caramel,630.00
46001,Rostro,Polvo Translúcido,Light,500.00
46002,Rostro,Polvo Translúcido,Medium,500.00
34030,Ojos,Sombra e Iluminador Cejas,,485.00
38012,Rostro,Rubor Polvo Mini,Brandy,460.00
38015,Rostro,Rubor Polvo Mini,Sunset,460.00
38023,Rostro,Rubor Polvo Mini,Luz de Sol,460.00
38014,Rostro,Rubor Polvo Mini,Terracota,460.00
38010,Rostro,Rubor Polvo Mini,Desert,460.00
38024,Rostro,Rubor Polvo Mini,Berry,460.00
36019,Rostro,Maquillaje Máxima Cobertura,Cream,380.00
36020,Rostro,Maquillaje Máxima Cobertura,Medium Beige,380.00
36042,Rostro,Maquillaje Máxima Cobertura,Neutral Cool,380.00
36022,Rostro,Maquillaje Máxima Cobertura,Biscuit,380.00
36037,Rostro,Maquillaje Máxima Cobertura,Avellana,380.00
36043,Rostro,Maquillaje Máxima Cobertura,Neutral,380.00
39004,Ojos,Intense Volume Máscara,,320.00
39006,Ojos,Intense Volume Máscara (Rosa),,320.00
39008,Ojos,Intense Volume Máscara (Azul),,320.00
41000,Ojos,Doll Mascara,,410.00
39000,Ojos,Milan Wondermascara,,550.00
43007,Ojos,Gel Cejas,Light Brown,340.00
43006,Ojos,Gel Cejas,Medium Brown,340.00
43005,Ojos,Gel Cejas,Warm Brown,340.00
44002,Ojos,Lápiz Delineador Ojos,Classic Black,170.00
45017,Ojos,Pincel Indeleble,Mocha Coffee,250.00
44006,Ojos,Lápiz Smoky,Black,220.00
44009,Ojos,Lápiz Maximizador,White,230.00
34017,Ojos,Paleta Sombras,Sweet Fantasy,670.00
34043,Ojos,Paleta Sombras,Laguna,670.00
34036,Ojos,Paleta Sombras,London Eye,670.00
34047,Ojos,Paleta Sombras,Gemstone,670.00
34059,Ojos,Paleta Sombras,Autumn Glam,670.00
34042,Ojos,Dúo Sombras,Golden Night,570.00
34039,Ojos,Dúo Sombras,Ocean,570.00
34048,Ojos,Dúo Sombras,Raspberry Lady,570.00
33020,Labios,Brillo Labial,Nude,255.00
33023,Labios,Brillo Labial,Mocha,255.00
33064,Labios,Brillo Labial,Angel,255.00
33066,Labios,Brillo Labial,Dalia Cream,255.00
33025,Labios,Brillo Labial,Pearly,255.00
33028,Labios,Brillo Labial,Cereza,255.00
33027,Labios,Brillo Labial,Bugambilia,255.00
33000,Labios,Lápiz Labial Humectante (Varios),,300.00
33061,Labios,Aceite Labios,Watermelon,215.00
33062,Labios,Aceite Labios,Peach,215.00
33063,Labios,Aceite Labios,Strawberry,215.00
33086,Labios,Aceite Labios,Grapefruit,215.00
33085,Labios,Aceite Labios,Grape,215.00
31019,Labios,Labial Mate,Intense Red,330.00
31026,Labios,Labial Mate,Almond Bronze,330.00
31027,Labios,Labial Mate,French Passion,330.00
31029,Labios,Labial Mate,Rouge Kiss,330.00
31042,Labios,Labial Mate,Cometa,330.00
31045,Labios,Labial Mate,Bindi Red,330.00
31064,Labios,Labial Mate,Lucky Pink,330.00
31066,Labios,Labial Mate,Diva,330.00
31049,Labios,Labial Mate,Red Danger,330.00
31050,Labios,Labial Mate,Fucsia,330.00
31051,Labios,Labial Mate,Corazón,330.00
31052,Labios,Labial Mate,Orquídea,330.00
31047,Labios,Labial Mate,Durazno,330.00
31039,Labios,Labial Mate,Candy,330.00
31053,Labios,Labial Mate,Marilyn,330.00
31067,Labios,Labial Mate,Piccadilly,330.00
31078,Labios,Labial Mate,Chelsea,330.00
31054,Labios,Labial Mate,Tierra,330.00
31055,Labios,Labial Mate,Rosewood,330.00
31057,Labios,Labial Mate,Clay,330.00
31061,Labios,Labial Mate,Plum,330.00
31068,Labios,Labial Mate,Brunette,330.00
61002,Fragancias,Mua Mua Agua de Tocador,,485.00
51057,Fragancias,Notes Exotiques Parfum (Caballero),Mandarine Italienne,1520.00
51050,Fragancias,Notes Exotiques Parfum (Caballero),Vétiver Citrique,1520.00
51052,Fragancias,Notes Exotiques Parfum (Caballero),Cédre Explosif,1520.00
51053,Fragancias,Notes Exotiques Parfum (Caballero),Lavande Intense,1520.00
51055,Fragancias,Notes Exotiques Parfum (Caballero),Tonka Exquis,1520.00
51051,Fragancias,Notes Exotiques Parfum (Caballero),Gaïac Extravagant,1520.00
61062,Fragancias,Refill Parfum Dama,Poivre Rose,900.00
61051,Fragancias,Refill Parfum Dama,Rose Du Maroc,900.00
61054,Fragancias,Refill Parfum Dama,Éclat D'Ylang,900.00
61050,Fragancias,Refill Parfum Dama,Violette Passionné,900.00
61052,Fragancias,Refill Parfum Dama,Jasmin Vivant,900.00
61049,Fragancias,Refill Parfum Dama,The Vert,900.00
51058,Fragancias,Refill Parfum Caballero,Mandarine Italienne,900.00
51044,Fragancias,Refill Parfum Caballero,Vétiver Citrique,900.00
51046,Fragancias,Refill Parfum Caballero,Cédre Explosif,900.00
51047,Fragancias,Refill Parfum Caballero,Lavande Intense,900.00
51049,Fragancias,Refill Parfum Caballero,Tonka Exquis,900.00
51045,Fragancias,Refill Parfum Caballero,Gaïac Extravagant,900.00`

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ message: 'Only POST allowed' })
    }

    try {
        await dbConnect()

        // Clear existing products to avoid duplicates during dev
        await Product.deleteMany({})

        const lines = productsCSV.split('\n')
        const products = []

        const originalPriceMap = {
            "11012": 750, "11013": 870, "11016": 195, "13013": 330,
            "13014": 380, "15004": 380, "16002": 720, "18007": 315,
            "19008": 380, "19011": 370, "21009": 430, "21057": 460,
            "21060": 430, "21063": 430, "23054": 360, "23080": 360,
            "23082": 600, "23083": 600, "23084": 600, "23085": 430,
            "23087": 360, "25007": 360, "25008": 500, "27037": 740,
            "27046": 445, "27054": 550, "27067": 720, "27088": 430,
            "28003": 400, "28004": 400,
            "29001": 210, "29002": 210, "29006": 210,
            "29003": 245, "29004": 245, "29007": 245,
            "33033": 325, "33034": 325, "33035": 325, "33036": 325,
            "33037": 325, "33046": 325, "33047": 325, "33048": 325, "33049": 325,
            "36024": 445, "36025": 445, "36026": 445, "36027": 445,
            "36028": 445, "36029": 445, "36030": 445, "36044": 445,
            "41013": 250, "41014": 250, "41015": 250, "41016": 250, "41017": 250,
            "39007": 780, "46005": 495, "51006": 890, "51005": 600, "61010": 600,
            "61048": 485, "61065": 700, "01921": 1520, "01922": 1520,
            "01924": 1520, "01923": 1520, "01925": 1485, "01926": 1670,
            "01927": 1360
        }

        for (const line of lines) {
            if (!line.trim()) continue
            // CSV format: Clave,Categoria,Producto,Variante/Tono,Precio
            const [key, category, name, variant, price] = line.split(',')

            if (!key || !name || !price) continue

            products.push({
                key: key.trim(),
                category: category.trim(),
                name: name.trim(),
                variant: variant ? variant.trim() : null,
                price: parseFloat(price.trim()),
                originalPrice: originalPriceMap[key.trim()] || null,
                image: '/assets/placeholder.jpg',
                description: ''
            })
        }

        await Product.insertMany(products)

        res.status(200).json({ success: true, count: products.length, message: 'Products seeded successfully V6' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, error: error.message })
    }
}
