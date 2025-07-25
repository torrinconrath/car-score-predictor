-- CAR MANAGEMENT DUMP 7.2025

SET NAMES utf8;
SET time_zone = '-05:00';
SET foreign_key_checks = 0;
SET sqlmode = 'NO_AUTO_VALUE_ON_ZERO';

-- EXAMPLE TABLE TEMP 7.2

DROP TABLE IF EXISTS `TrainingCars`;
CREATE TABLE `TrainingCars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `carModel` text NOT NULL,
    `condition` text NOT NULL,
    `mileage` text NOT NULL,
    `price` text NOT NULL,
    `monthlyPayment` text NOT NULL,
    `dealerName` text NOT NULL
);

INSERT INTO `TrainingCars` (`carModel`, `condition`, `mileage`, `price`, `monthlyPayment`, `dealerName`)
VALUES
    ("2023 BMW M2 Base", "Used", "2,496 mi.", "$63,000", "Est. $1,184/mo", "Murgado Ford of Chicago"),
    ("2020 Dodge Charger SXT", "Used", "98,302 mi.", "$14,995", "Est. $282/mo", "Blue Sky Auto Sales - Brighton Park"),
    ("2016 Scion iM Base", "Used", "72,040 mi.", "$12,690", "Est. $239/mo", "Mcgrath Evanston Subaru"),
    ("2022 Volvo XC60 Recharge Plug-In Hybrid T8 Inscription", "Used", "31,580 mi.", "$38,998", "Est. $733/mo", "CarMax Birmingham"),
    ("2012 Mitsubishi Lancer SE", "Used", "54,197 mi.", "$9,995", "Est. $188/mo", "Moto Zone Inc."),
    ("2023 Chevrolet Bolt EUV FWD LT", "Used", "19,045 mi.", "$18,995", "Est. $357/mo", "Luxury Motors Credit"),
    ("1984 BMW 733 733i", "Used", "139,186 mi.", "$17,985", "Est. $338/mo", "Chicago Cars US"),
    ("2017 Toyota Highlander XLE", "Used", "84,581 mi.", "$23,998", "Est. $451/mo", "CarMax Charleston"),
    ("2021 Lexus ES 250 250", "Used", "25,336 mi.", "$29,708", "Est. $558/mo", "The Autobarn Volkswagen of Countryside"),
    ("2025 Chevrolet Trailblazer LT", "New", "", "$27,970", "Est. $526/mo", "Jennings Chevy / VW"),
    ("2017 Lexus GS 350 F Sport", "Used", "44,156 mi.", "$30,888", "Est. $581/mo", "Chicago Auto Place"),
    ("2020 Lincoln Continental Reserve", "Used", "48,625 mi.", "$31,395", "Est. $590/mo", "Napleton Autowerks River Oaks"),
    ("2021 Lexus ES 250 250", "Used", "13,860 mi.", "$33,995", "Est. $639/mo", "Lombard Toyota"),
    ("2014 Cadillac CTS-V Base", "Used", "12,664 mi.", "$52,995", "Est. $996/mo", "D&M Motorsports"),
    ("2020 Lexus RC 350 F Sport", "Used", "30,200 mi.", "$36,700", "Est. $690/mo", "Volvo Cars Lisle"),
    ("2011 Audi TTS 2.0T Premium Plus", "Used", "34,316 mi.", "$22,995", "Est. $432/mo", "Auto Showcase of Carol Stream"),
    ("2021 BMW M2 Competition", "Used", "37,060 mi.", "$48,849", "Est. $918/mo", "Gravity Autos Chicago"),
    ("1997 Ferrari F355 Spider", "Used", "27,096 mi.", "$92,800", "Est. $1,744/mo", "Diamond Motorworks"),
    ("2021 Lexus RX 350L Base", "Used", "26,094 mi.", "$38,505", "Est. $724/mo", "Muller's Woodfield Acura"),
    ("1999 Toyota Celica SS3 5 SPEED MANUAL", "Used", "84,529 mi.", "$15,990", "Est. $301/mo", "Car City Inc"),
    ("2009 INFINITI FX50 FX50 AWD", "Used", "154,947 mi.", "$11,990", "Est. $225/mo", "Car City Inc"),
    ("2022 Audi e-tron GT Premium Plus", "Used", "7,029 mi.", "$53,569", "Est. $1,007/mo", "Alfa Romeo of Naperville"),
    ("2021 Lexus LS 500 F Sport", "Prequalify now", "105,213 mi.", "$40,995", "Est. $771/mo", "Baha Auto Sales"),
    ("2020 Audi A3 2.0T Premium", "Used", "48,880 mi.", "$21,850", "Est. $411/mo", "Sherman Dodge Chrysler Jeep RAM"),
    ("2024 Ford Bronco Sport Free Wheeling", "New", "", "$37,270", "Est. $701/mo", "Al Piemonte Ford"),
    ("2020 Genesis G70", "Used", "54,213 mi.", "$22,998", "Est. $432/mo", "CarMax Austin South"),
    ("2006 Jeep Commander Base", "Used", "136,973 mi.", "$5,000", "Est. $94/mo", "Advantage Chevrolet of Bridgeview"),
    ("2019 Ford EcoSport SE", "Used", "70,726 mi.", "$15,998", "Est. $301/mo", "CarMax Oak Lawn"),
    ("2023 Cadillac XT4 Luxury", "Used", "18,709 mi.", "$29,998", "Est. $564/mo", "CarMax Jacksonville"),
    ("2024 Ford Transit-250 148 WB Medium Roof Cargo", "New", "", "$47,699", "Est. $897/mo", "Bredemann Ford"),
    ("2024 Ford Transit-250 Base", "New", "", "$52,399", "Est. $985/mo", "Bredemann Ford"),
    ("2024 Ford Ranger XLT", "New", "", "$44,599", "Est. $838/mo", "Bredemann Ford"),
    ("2012 Land Rover LR2 AWD 4dr HSE", "Used", "110,658 mi.", "$7,750", "Est. $146/mo", "Revved Motors"),
    ("2022 Porsche 718 Cayman GT4", "Used", "14,788 mi.", "$137,500", "Est. $2,585/mo", "Napleton Aston Martin Maserati"),
    ("2025 Kia Carnival Hybrid EX", "New", "", "$43,873", "Est. $825/mo", "Napleton River Oaks Hyundai Kia"),
    ("2014 Nissan Murano CrossCabriolet Base", "Used", "76,400 mi.", "$11,990", "Est. $225/mo", "Auto House Motors"),
    ("2024 Mercedes-Benz EQB 350 4MATIC", "New", "", "$63,115", "Est. $1,186/mo", "Mercedes-Benz of Orland Park"),
    ("2024 Ford Transit-250 Base", "New", "", "$44,966", "Est. $845/mo", "Ford of Homewood");


-- Real Table 7/5
-- time,title,model,condition,year,price,monthly_payment,mileage,dealer,link

--     `accident` INT,
--     `owners` INT,
--     `usage` INT,

DROP TABLE IF EXISTS `Cars`;
CREATE TABLE `Cars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` text NOT NULL,
    `make` text NOT NULL,
    `model` text NOT NULL,
    `modelTitle` text, 
    `condition` text,
    `year` text,
    `mileage` text,
    `price` text ,
    `monthlyPayment` text ,
    `dealer` text,
    `region` text,
    `state` text,
    `value` float,
    `style` text,
    `link` text NOT NULL,
    `time` text NOT NULL
);
