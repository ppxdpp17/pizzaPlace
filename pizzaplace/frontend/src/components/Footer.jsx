import React from 'react';
import { Phone } from 'lucide-react';

const Footer = () => {
  const locations = [
    {
      name: "Bragança (Shopping)",
      link: "https://www.facebook.com/bigbossbragance.pt/",
      phone: "123 456 789"
    },
    {
      name: "Bragança (Av. João da Cruz)",
      link: "https://www.facebook.com/bigbossbraganca.pt",
      phone: "987 654 321"
    },
    {
      name: "Vila Real",
      link: "https://www.facebook.com/bigbossvilareal.pt",
      phone: "121 343 454"
    },
    {
      name: "Chaves",
      link: "https://www.facebook.com/bigbosschaves.pt",
      phone: "999 086 544"
    },
    {
      name: "Braga",
      link: "https://www.facebook.com/bigbossbraga.pt",
      phone: "997 748 615"
    }
  ];

  return (
    <footer className="bg-white/60 backdrop-blur-md border-t border-orange-200 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0">

          {/* Logos */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">As Nossas Marcas</h3>
            <div className="flex space-x-6 items-center bg-white/50 p-4 rounded-xl shadow-sm border border-orange-100">
              <img src="/logo.png" alt="Big Boss" className="h-14 object-contain hover:scale-105 transition-transform" />
              {/* <img src="/pizzaMais.png" alt="Pizza Mais" className="h-14 object-contain hover:scale-105 transition-transform" /> */}
              {/* <img src="/logo.png" alt="F'grill" className="h-14 object-contain hover:scale-105 transition-transform" /> */}
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Onde Estamos</h3>
            <ul className="space-y-3">
              {locations.map((loc, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <a
                    href={loc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 font-medium hover:text-red-600 transition-colors"
                  >
                    {loc.name}
                  </a>
                  <span className="hidden sm:inline-block text-gray-400">|</span>
                  <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group">
                    <Phone className="w-4 h-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
                    {loc.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-orange-200 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Direitos de autor © 2026, Big Boss e Pedro Duarte
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
