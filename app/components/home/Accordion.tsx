"use client";
import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

export default function ControlledAccordions() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 my-7">
      <div className="text-3xl font-bold text-center text-gray-800 mb-10">
        En Çok Sorulan Sorular
      </div>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
        className="transition-all duration-500 ease-in-out shadow-2xl border border-gray-200 rounded-xl bg-white hover:shadow-3xl mb-6"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          className="bg-gradient-to-r from-purple-50 to-teal-150 p-6 rounded-t-xl"
        >
          <Typography className="text-xl font-semibold text-gray-800 p-1.5">
            Hangi vitamin ve takviyeler en faydalıdır?
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white p-8 rounded-b-xl backdrop-blur-md bg-opacity-80">
          <Typography className="text-gray-700 text-sm p-1.5">
            Her bireyin ihtiyaçları farklıdır, ancak D vitamini kemik sağlığı
            için, C vitamini bağışıklık sistemini güçlendirmek için, Omega-3 ise
            kalp sağlığına faydalıdır. Hangi takviyeyi almanız gerektiği
            konusunda doktorunuza danışmak önemlidir.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
        className="transition-all duration-500 ease-in-out shadow-2xl border border-gray-200 rounded-xl bg-white hover:shadow-3xl mb-6"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
          className="bg-gradient-to-r from-purple-50 to-teal-150 p-6 rounded-t-xl"
        >
          <Typography className="text-xl font-semibold text-gray-800 p-1.5">
            Günlük ne kadar D vitamini almalıyım?
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white p-8 rounded-b-xl backdrop-blur-md bg-opacity-80">
          <Typography className="text-gray-700 text-sm p-1.5">
            Birçok faktöre bağlı olarak, günlük alınması gereken D vitamini
            miktarı değişebilir. Genelde, yetişkinler için 600-800 IU arasında
            bir doz önerilir. Ancak, kişisel ihtiyaçlarınıza göre doktorunuz
            size daha spesifik bir dozaj verebilir.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
        className="transition-all duration-500 ease-in-out shadow-2xl border border-gray-200 rounded-xl bg-white hover:shadow-3xl"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
          className="bg-gradient-to-r bg-white/30 p-6 rounded-t-xl from-purple-50 to-teal-150"
        >
          <Typography className="text-xl font-semibold text-gray-800 p-1.5">
            Siparişim ne zaman teslim edilir?
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white p-8 rounded-b-xl backdrop-blur-md bg-opacity-80">
          <Typography className="text-gray-700 text-sm p-1.5">
            Siparişiniz, ödeme onaylandıktan sonra genellikle 1-3 iş günü içinde
            kargoya verilir. Kargo süresi, adresinize göre değişiklik
            gösterebilir. Siparişinizin durumu hakkında daha fazla bilgi almak
            için müşteri hizmetlerimizle iletişime geçebilirsiniz.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
