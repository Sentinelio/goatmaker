/* ---- DATOS DEL POOL: una entrada por ORIGEN ----
   n     nombres de pila, de más a menos frecuentes. Sin marca valen para todas las edades; «+» solo jóvenes (jugadores); «-» solo veteranos (míster, agente).
   a     apellidos, de más a menos frecuentes. «_» = espacio («De_Luca» → «De Luca»).
   comp  nombres compuestos reales (separados por «|») y pcomp su probabilidad entre jugadores (entre veteranos se multiplica por 6, máx. 0,30).
   dob   probabilidad de segundo apellido (se duplica en míster y agente).
   mn / ma  mezclas realistas: [[origen, prob]] → el nombre de pila / el apellido sale a veces de otro origen (el vasco «Aitor García», el francés «Enzo Diallo»…). */
var NOM_DATA={
 es:{ n:"Daniel David Javier Alejandro Adrián Álvaro Pablo Sergio Carlos Jorge Rubén Miguel Iván Alberto Raúl Diego Marcos Víctor Antonio Manuel Jesús José Juan Francisco Luis Ángel Fernando Mario Rafael Pedro"
        +" +Hugo Samuel Óscar Roberto Guillermo Gonzalo +Iker +Mateo Ismael Borja Rodrigo Cristian Jaime Andrés +Lucas Joaquín Enrique Eduardo Santiago +Unai +Aitor Ramón Ricardo Vicente Julián Aarón Gabriel Joel"
        +" Nicolás Isaac Moisés Jonathan Christian Josué Abel Álex Dani Nacho Nico Edu Kike Javi Toni Fran Migue Rafa +Martín +Leo +Ander +Jon +Bruno +Darío +Enzo +Thiago +Eric +Kevin +Yeray +Ayoze +Aythami +Cristo"
        +" +Airam +Jonay +Yeremi +Juanmi +Josemi +Luismi +Fede +Adri +Rober +Rodri +Moi +Pelayo +Noel"
        +" -Manolo -Paco -Pepe -Quique -Chema -Juanjo -Juanma -Ernesto -Marcelino -Gregorio -Emilio -Mariano -Salvador -Agustín -Lorenzo -Tomás -Rodolfo -Gerardo -Felipe -Ginés -Valentín -Eusebio -Rogelio -Alfredo -Julio",
      a:"García González Rodríguez Fernández López Martínez Sánchez Pérez Gómez Martín Jiménez Ruiz Hernández Díaz Moreno Muñoz Álvarez Romero Gutiérrez Alonso Navarro Torres Domínguez Vázquez Ramos Gil Ramírez Serrano Blanco"
        +" Molina Morales Suárez Ortega Delgado Castro Ortiz Rubio Marín Sanz Núñez Iglesias Medina Garrido Cortés Castillo Santos Lozano Guerrero Cano Prieto Méndez Cruz Calvo Gallego Vidal León Márquez Herrera Peña Flores"
        +" Cabrera Campos Vega Fuentes Carrasco Díez Reyes Caballero Nieto Aguilar Pascual Santana Herrero Montero Lorenzo Hidalgo Giménez Ibáñez Durán Benítez Mora Vargas Arias Carmona Crespo Pastor Soto Sáez Velasco Moya"
        +" Soler Parra Bravo Gallardo Rojas Cuesta Lara Ponce Pardo Redondo Barrios Bermúdez Camacho Cordero Quintero Heredia Salas Villar Escudero Galán Bernal Segura Miranda Acosta Zamora Valverde Maldonado Arroyo Paredes"
        +" Robles Oliva Quesada Haro Tapia Olmedo Naranjo Solís Mateos Bautista Paniagua Tello Avilés Cobo Expósito Barba Luque Rivas Alarcón Rueda Beltrán Cabello Plaza Perea Ballesteros Arjona Bueno Cuevas Merino Casado"
        +" Palomo Escribano Gordillo Trujillo Pulido Carrillo Villanueva Contreras Espinosa Montes Rosales Sierra Cantero Zapata Valdés Valle Villalba Gamero Roldán Merchán Ojeda Pizarro Lillo Bermejo Montoya Rincón"
        +" Barroso Collado Olivares Cebrián Lobato Marqués Camino Almagro Alcaraz Alcázar Alba Albarracín Aranda Arévalo Ávila Baena Barranco Becerra Bellido Berenguer Bonilla Borrego Briones Bustamante Cáceres Calderón"
        +" Calleja Campillo Candela Cañas Cárdenas Carretero Cerezo Cervantes Chacón Checa Clemente Conde Corral Dávila Donoso Escobar Espejo Estévez Fajardo Ferreras Figueroa Frías Gálvez Gimeno Granados Guillén"
        +" Guzmán Hurtado Infante Izquierdo Juárez Laguna Lasheras Ledesma Lobo Loza Machado Maestre Manzano Mariscal Mena Mesa Mínguez Monje Montesinos Muriel Noguera Nogales Obregón Ocaña Olivera Orozco Osuna Pacheco"
        +" Padilla Palacios Peláez Pinto Pineda Porras Pozo Puerta Quiroga Rangel Ríos Rosado Sandoval Sepúlveda Sosa Tejada Tena Toro Trillo Uribe Valero Varas Vallejo Vela Venegas Verdú Vilches Villegas Yáñez"
        +" Carbajal Collantes Esquivel Fonseca Granero Lorente Martos Nebot Pedraza Peñalver Polo Quirós Roa Sabater Santamaría Torrijos Tudela Urbano Valencia Villaverde Zurita Abad Aguado Alcalde Aldana Amador"
        +" Ariza Atienza Ayala Barbero Barrera Bejarano Benavente Bernabé Bolaños Bustos Cabañas Calvente Camarero Canales Cañizares Castaño Castellano Cañete Chaves Cid Cordón Cubero Cuéllar Chamorro Dueñas Elvira Fidalgo"
        +" Fresneda Galindo Gaitán Gárate Garzón Godoy Grande Guijarro Heras Hinojosa Hoyos Huertas Illán Jara Jover Lagos Leal Linares Llamas Madrigal Maqueda Mejías Melero Mingo Mohedano Moraleda Moyano Nevado"
        +" Olmos Ordóñez Pastrana Patiño Pedrosa",
      comp:"José Luis|José Manuel|José Antonio|José Ángel|José María|José Ramón|José Carlos|Juan Carlos|Juan Antonio|Juan Manuel|Juan José|Juan Luis|Luis Miguel|Luis Alberto|Luis Fernando|Miguel Ángel|Francisco Javier|Ángel Luis|Carlos Alberto|Pedro Antonio",
      pcomp:0.03, dob:0.05, ma:[["cat",0.04],["gal",0.05],["eus",0.03]], mn:[] },

 cat:{ n:"Marc Pau Pol Arnau Oriol Aleix Jordi Joan Josep Xavi Albert Ferran Gerard Jaume Guillem Roger Eric Sergi Adrià Nil Genís Bernat Eloi Quim Martí Lluc Ignasi Isaac Joel Jan Llorenç Roc +Biel +Èric"
        +" -Ramon -Narcís -Lluís -Pere -Francesc -Miquel -Salvador",
      a:"Puig Ferrer Vila Serra Soler Roca Pons Mas Casas Bosch Vidal Ribas Pujol Costa Camps Prat Sala Font Grau Planas Tort Vilar Bou Oliver Riera Rovira Torrent Subirats Gual Escofet Carbonell Palau Pla Bertran Mercader"
        +" Closa Roig Marsal Pastor Domènech Canals Cardona Castells Clavell Colomer Comas Compte Coll Duran Esteve Farré Gasull Guasch Isern Jordà Llobet Lladó Lloret Margarit Martorell Massana Moll Montserrat Munné"
        +" Oller Parés Pi Pich Piñol Pujadas Queralt Rafart Rius Rodó Sabaté Sagrera Salvat Sanmartí Sans Sastre Sendra Sunyer Tarrés Teixidor Terrades Tomàs Valls Vendrell Ventura Viñas Vives Alsina Artigas Badia Baró"
        +" Bargalló Bonet Cabré Calafell Camprubí Casanovas Castellví Cuní Dalmau Fabra Fargas Galí Girbau Gironès Gispert Guitart Jordana Llach Miró Molas Morera Mir Ollé Orriols Padrós Pascual Perarnau Ràfols Saura",
      comp:"Josep Maria|Joan Carles|Josep Lluís|Joan Manuel|Josep Antoni|Francesc Xavier|Joan Marc|Pere Antoni",
      pcomp:0.02, dob:0.04, ma:[["es",0.30]], mn:[["es",0.22]] },

 eus:{ n:"Iker Unai Aitor Asier Gorka Mikel Ander Beñat Xabier Imanol Jon Ibai Odei Eneko Julen Oier Aritz Markel Ekain Xabi Iñigo Urko Kepa Josu Endika Gaizka Ion Haritz Hodei Eder Igor Ibon Jokin Iñaki Aimar Arkaitz"
        +" Bittor Iban Lander Oihan Unax Urtzi Koldo Peru -Andoni -Joseba -Patxi -Txomin -Txetxu",
      a:"Etxeberria Goikoetxea Zubiaurre Urkiza Aguirre Arrieta Mendizabal Larrañaga Irazusta Olazábal Ibarra Zabala Uriarte Elorza Garmendia Lasa Otegi Iriondo Arana Barrena Múgica Altuna Aranburu Ugarte Urrutia"
        +" Beitia Gorostiaga Echave Etxarri Zugasti Larrea Landa Mendiola Olaizola Ormaetxea Sagarna Unzueta Erkoreka Gabilondo Amezaga Ansola Iturbe Murua Oiarzabal Aizpurua Aldasoro Aramendi Arregui Astigarraga"
        +" Azkarate Bengoetxea Egia Elizondo Galdós Gorrotxategi Intxausti Iparraguirre Izagirre Jaureguizar Larraz Lekue Mugarza Oñate Orbegozo Otxoa Sarasola Tellaetxe Ulibarri Urquijo Zarraga Zuazo Zubillaga"
        +" Agirre Aranguren Arriaga Basterra Berasategui Bergara Celaya Dorronsoro Eguren Eizaguirre Elosegi Eraso Ezeiza Garaikoetxea Garro Goenaga Guridi Gurruchaga Imaz Irigoyen Isasi Jauregi Laskurain",
      comp:"", pcomp:0, dob:0.04, ma:[["es",0.35]], mn:[["es",0.25]] },

 gal:{ n:"Iago Brais Anxo Roi Lois Noel Breogán Martiño Xurxo Antón Uxío Alexandre Suso Fran Santi Manu Nacho Rodri +Hugo -Xosé -Xoán -Manoel",
      a:"Souto Pazos Vilas Lage Outeiro Seoane Barral Varela Cedeira Insua Ferreiro Piñeiro Carballo Sanmartín Louro Lourido Mosquera Taboada Caamaño Abalo Bouzas Cancela Docampo Freire Fraga Leiro Losada Meira Neira"
        +" Otero Pena Rial Sobrino Táboas Vieites Castro Rivas Conde Paz Pereira Prado Salgado Sampedro Santalla Seijas Somoza Tojeiro Torrado Valiño Veiga Vilariño Currás Cabaleiro Cortiñas Dopico Eirín Figueiras Gontán"
        +" Lamas Lema Louzao Mariño Nogueira Orjales Pardiñas Pedrouzo Penas Quintela Regueiro Reboredo Sieiro Tarrío Teijeiro Touriño Troncoso Valcárcel Barreiro Blanco Boo Bugallo Calvo Cordeiro Corral Domínguez Dourado"
        +" Estévez Ferrín Gándara Gestal Lires Lorenzo Maceiras Maneiro Mouriz Naveira Nóvoa Padín Pose Quiroga Rodeiro Rubial Vázquez",
      comp:"", pcomp:0, dob:0.04, ma:[["es",0.35]], mn:[["es",0.50]] },

 ar:{ n:"Matías Nicolás Facundo Lautaro Santiago Franco Gonzalo Maximiliano Agustín Joaquín Federico Emiliano Leandro Lucas Martín Ezequiel Julián Rodrigo Sebastián Damián Cristian Gastón Ignacio Tomás Bruno Thiago Ramiro"
        +" Brian Jonathan Mauro Pablo Diego Gabriel Juan Ariel Alan Valentín Bautista Lisandro Alexis Axel Fabricio Luciano Mariano Mathías Darío Emanuel Kevin Marcos Alejandro Fernando Sergio Carlos Javier"
        +" -Claudio -Hernán -Marcelo -Walter -Mauricio -Gerardo -Eduardo -Ricardo -Osvaldo -Néstor -Roberto -Gustavo -Oscar",
      a:"Gómez Rodríguez Fernández González Pérez López Díaz Martínez Romero Sosa Benítez Acosta Medina Herrera Suárez Aguirre Giménez Gutiérrez Pereyra Ruiz Torres Peralta Domínguez Castro Molina Ledesma Villalba Cabrera"
        +" Ferreyra Bustos Moyano Rojas Luna Paz Ibarra Escobar Godoy Vega Maidana Gallardo Mansilla Altamirano Barrios Cardozo Núñez Figueroa Ojeda Quiroga Rivero Salinas Silva Soria Toledo Vera Videla Yáñez Zárate"
        +" Britos Cáceres Techera Viera Olivera Barreto Ferreira Pereira Machado Correa Cuello Duarte Fleitas Insaurralde Lencina Maciel Monzón Navarro Olmos Páez Palacios Quintana Riquelme Rolón Saravia Tapia Urquiza"
        +" Valdez Varela Zalazar Aranda Arce Avalos Bazán Bordón Carrizo Coronel Dávalos Echeverría Frías Garay Heredia Juárez Leiva Lescano Maldonado Miranda Montenegro Ortiz Pacheco Ponce Ríos Sandoval Sánchez Zabala",
      comp:"Juan Pablo|Juan Manuel|Juan Carlos|Juan José|Juan Ignacio|José Luis|Luis Alberto|Carlos Alberto",
      pcomp:0.02, dob:0.04, ma:[["it",0.12]], mn:[["es",0.20]] },

 lat:{ n:"Juan Santiago Camilo Jhon Duván Johan Cristian Brayan Kevin Wilmar Jefferson Alexis Edwin Andrés Jorge Óscar Miguel Luis Jesús Diego Sebastián Mauricio Gustavo Fabián Harold Yerson Yeferson Jhoan Yeison Dilan"
        +" Anderson Bryan Deiver Edison Elkin Bairon Jair Leonel Giovanni Erick Edson Axel César Alan Jonathan Rodolfo Ulises Omar Joel Roberto Marco Raúl Carlos David Daniel Alejandro Mateo Samuel Julián Esteban Felipe"
        +" Nicolás Mario Víctor Fernando José Ángel Rafael Pedro Pablo -Jaime -Hernán -Gerardo -Ricardo -Édgar",
      a:"Rodríguez Martínez Gómez Hernández Ramírez Cuesta Mosquera Palacios Torres Díaz García López Sánchez Pérez González Moreno Castillo Mejía Ortiz Ríos Restrepo Arboleda Mina Murillo Hurtado Quintero Marín"
        +" Cortés Ospina Cardona Bedoya Londoño Zapata Montoya Rentería Angulo Caicedo Chará Orejuela Perea Sinisterra Tenorio Medina Mendoza Chávez Vargas Ruiz Rojas Flores Salazar Reyes Cruz Morales Guerrero Jiménez"
        +" Aguilar Barrera Villegas Peña Escalante Contreras Salcedo Rincón Rondón Osorio Otálvaro Lemos Cifuentes Campaz Duque Giraldo Henao Lasso Lozano Mercado Muñoz Narváez Pabón Parra Patiño Pineda Polo Quiñones Ramos"
        +" Roa Robledo Santos Serna Tapia Ulloa Vásquez Velásquez Zúñiga Cabezas Cedeño Cevallos Delgado Espinoza Estupiñán Plata Preciado Sornoza Vite Quispe Huamán Mamani Condori Gonzales Ayala Benítez Cabrera Calderón"
        +" Carrillo Castro Cordero Duarte Echeverri Fonseca Gallego Gaviria Guzmán Herrera Ibáñez Jaramillo Lara Maldonado Mora Navarro Ocampo Pacheco Paredes Pinzón Prieto Rivera Salgado Sandoval Silva Soto Suárez Urrego",
      comp:"Juan Pablo|Juan Manuel|Juan Carlos|Juan José|Juan Camilo|Juan David|Luis Fernando|José Luis|Luis Miguel|Luis Alberto|Carlos Alberto|Jhon Jairo",
      pcomp:0.04, dob:0.05, ma:[["es",0.20]], mn:[["es",0.35]] },

 br:{ n:"Thiago Rodrigo Gabriel Vinícius Matheus Lucas Rafael Danilo Caio Everton Wesley Bruno Diego Leandro Felipe Guilherme Gustavo Henrique Igor João Luan Marcelo Murilo Pedro Renan Ricardo Samuel Willian Yuri André"
        +" Arthur Bernardo Breno Carlos Davi Denis Douglas Eduardo Fábio Fernando Gerson Hugo Jonathan Kaio Léo Luiz Marlon Natan Nathan Otávio Paulo Rômulo Wellington Alan Alex Anderson Cleiton Diogo Emerson Jean Jonas"
        +" Lincoln Michel Pablo Rogério Sandro Vitor Washington Wallace -Cláudio -Sérgio -Mauro",
      a:"Silva Santos Oliveira Souza Costa Pereira Rodrigues Almeida Carvalho Ribeiro Gomes Martins Barbosa Teixeira Cardoso Moreira Nascimento Lopes Batista Cavalcante Monteiro Mendes Ferreira Correia Machado Fonseca Coelho"
        +" Araújo Lima Alves Rocha Dias Freitas Moura Pinto Nunes Campos Azevedo Medeiros Cunha Farias Duarte Siqueira Vieira Tavares Borges Peixoto Guimarães Cruz Melo Miranda Andrade Barros Castro Leite Brito Bezerra"
        +" Magalhães Assis Amaral Aguiar Toledo Bastos Camargo Cordeiro Dantas Fagundes Figueiredo Lacerda Marques Paiva Prado Queiroz Ramos Rezende Sampaio Soares Tosta Valadares Xavier",
      comp:"João Pedro|João Victor|João Lucas|João Gabriel|Luiz Felipe|Luiz Henrique|Pedro Henrique|Pedro Lucas|Gabriel Henrique|Carlos Eduardo|Luiz Gustavo|José Carlos|Paulo Henrique|Marcos Paulo|Luís Fernando",
      pcomp:0.10, dob:0, ma:[], mn:[] },

 pt:{ n:"João Rúben Nuno Diogo Pedro André Gonçalo Miguel Tiago Rui Bruno Ricardo Hugo Rafael Daniel Francisco Tomás Duarte Vasco Dinis Afonso Simão Filipe Sérgio Luís Paulo Carlos Fábio Márcio Hélder Nélson Ivo Vítor Jorge"
        +" Telmo Gil Rodrigo Salvador Martim Leonardo José Manuel Henrique Eduardo Fernando Joel David Alexandre Tomé -António -Jaime -Joaquim -Álvaro",
      a:"Silva Santos Ferreira Pereira Oliveira Costa Rodrigues Martins Jesus Sousa Fernandes Gonçalves Gomes Lopes Marques Alves Almeida Ribeiro Pinto Carvalho Teixeira Moreira Correia Mendes Nunes Soares Vieira Monteiro"
        +" Cardoso Rocha Raposo Cunha Pires Fonseca Magalhães Machado Barbosa Tavares Antunes Borges Matos Cabral Henriques Sequeira Valente Coelho Salgueiro Amaral Bastos Belo Branco Brandão Caetano Campos Carneiro Castro"
        +" Dias Esteves Faria Figueiredo Freitas Guerreiro Leal Leite Loureiro Maia Marinho Melo Neto Peixoto Pimenta Queirós Ramalho Reis Ribas Sá Simões Torres Vaz Vidal",
      comp:"João Pedro|João Miguel|João Paulo|João Carlos|José Pedro|Luís Miguel|Pedro Miguel|Rui Pedro|Nuno Miguel",
      pcomp:0.07, dob:0, ma:[], mn:[] },

 fr:{ n:"Mathis Théo Hugo Lucas Enzo Nolan Yanis Maxime Julien Antoine Romain Quentin Florian Benjamin Valentin Baptiste Clément Rémi Axel Alexandre Nicolas Thomas Kévin Jérémy Anthony Léo Louis Jules Tom Adrien Arthur"
        +" Corentin Damien Dorian Étienne Gabriel Guillaume Jordan Lilian Loïc Mattéo Morgan Nathan Pierre Raphaël Sébastien Steven Tanguy Timothée Vincent Yoann Alexis Bastien Cédric Flavien Gaëtan Jonathan Marvin Rayan"
        +" Yohan -Laurent -Christophe -Philippe -Frédéric -Stéphane -Olivier -Didier -Patrick -Pascal -Franck -Éric -Yannick -Hervé -Raymond",
      a:"Dubois Moreau Laurent Lefèvre Girard Fontaine Rousseau Lambert Mercier Bonnet Roux Chevalier Perrin Morin Garnier Faure Blanc Guérin Masson Marchand Martin Bernard Petit Robert Richard Durand Leroy Simon Michel"
        +" Lefebvre David Bertrand Vincent Fournier Morel Giraud André Boyer Clément Gauthier Rolland Barbier Colin Arnaud Picard Renard Meunier Brun Gaillard Brunet Leclerc Maillard Poulain Denis Carré Collet Aubert"
        +" Hoarau Lacroix Leblanc Charpentier Renaud Dupuis Gilbert Hamon Lemaire Humbert Delmas Navarro Marques Besson Bouvier Bourgeois Caron Chauvin Delaunay Dumas Fabre Gaudin Guillot Huet Jacquet Joly Klein Lacombe"
        +" Langlois Lebrun Lemoine Lopez Marie Mathieu Noël Paris Philippe Pichon Poirier Pons Prévost Rivière Schmitt Tessier Thibault Vidal Weber",
      comp:"", pcomp:0, dob:0, ma:[["afo",0.14],["mag",0.07]], mn:[] },

 afo:{ n:"Moussa Ibrahima Mamadou Cheikh Idrissa Pape Boubacar Abdoulaye Seydou Souleymane Ousmane Amadou Bakary Lamine Mohamed Ismaila Kalidou Papa Modou Alassane Issa Sekou Sidi Yacouba Adama Aboubakar Djibril Salif"
        +" Gaoussou Tiémoko Hamidou Mory Lassana Samba Dramane Fodé Ibou Demba Sadio Ablaye Bouna Birama Famara Abdou Aliou Bocar Mansour Oumar Thierno Youssouf Yaya Zakaria Diadie Habib Kader",
      a:"Diallo Diop Ndiaye Sow Sarr Fall Camara Traoré Keita Coulibaly Konaté Touré Sissoko Diakité Cissé Bamba Doumbia Koné Ouattara Sylla Barry Bah Balde Gueye Thiam Faye Mbaye Ba Niang Sy Seck Samb Sané Mendy Badji"
        +" Sagna Diatta Cissokho Kanté Dembélé Bakayoko Sanogo Doukouré Soumaré Fofana Gassama Kamara Dansoko Sidibé Diarra Dramé Haidara Tounkara Sangaré Bangoura Condé Soumah Sakho Sambou Ndoye Ndour Mboup Lô Kouyaté"
        +" Cissoko Danfa Diouf Gning Kébé Kourouma Maïga Ouédraogo Sawadogo Tamboura Yattara Zerbo",
      comp:"", pcomp:0, dob:0, ma:[], mn:[["fr",0.10]] },

 afa:{ n:"Emmanuel Kwame Kofi Samuel Joseph Chidera Tunde Femi Ebuka Obinna Kelechi Chibuike Victor Ola Daniel Isaac Michael Moses Ademola Kingsley Nathaniel Raphael Francis Godfrey Innocent Stanley Peter Paul Taiwo"
        +" Wilfred Bright Joe Abdul Iddrisu Ibrahim Alhassan Yusuf Felix Gideon Prince Ernest Elijah Solomon Bernard Collins Eric",
      a:"Mensah Boateng Owusu Asante Adeyemi Okafor Eze Nwosu Okonkwo Balogun Adebayo Ogunleye Adeleke Akinola Ajayi Amoah Appiah Aryeetey Baffour Danso Frimpong Gyasi Ibrahim Kuffour Lawal Mohammed Nkansah Ofori Okoro"
        +" Olawale Osei Quaye Sarpong Tetteh Yeboah Amankwah Badu Adjei Bonsu Opoku Agyemang Antwi Anyanwu Emenike Adegoke Afolabi Akpan Alabi Bello Chukwu Eboh Etim Igwe Mbah Obi Ogbu Onyeka Oyewole Usman",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 mag:{ n:"Youssef Hamza Karim Amine Ismael Bilal Sofiane Mehdi Nabil Yassine Anass Achraf Soufiane Zakaria Mohamed Ahmed Adil Ayoub Hicham Houssem Ilyas Mounir Rachid Reda Sami Walid Yahya Younes Abdel Brahim Aymen"
        +" Fayçal Hakim Idriss Jawad Khalid Marwan Omar Tarik Mustapha Said Anouar Chakib Driss Farid Ghali Hassan Imad Jalal Kamal Lahcen Nadir Samir",
      a:"Benali Haddad Mansouri Tazi Alaoui Idrissi El_Idrissi Berrada Chraibi Lahlou Benkirane Bouazza Zerouali Belhadj Boukhari Bennani Cherkaoui Daoudi El_Amrani El_Fassi Fassi Hajji Hammouti Kabbaj Lamrani Makhloufi"
        +" Messaoudi Naciri Ouazzani Rahmani Sebbar Slimani Tahiri Touzani Zaidi Zouhair Bouzid Belkacem Cherif Djebbar Hamdi Khelifi Medjani Mokhtari Saadi Yahiaoui Amrani Chaoui El_Ghazi Filali Guerrouj Hakimi",
      comp:"", pcomp:0, dob:0, ma:[], mn:[["fr",0.12]] },

 it:{ n:"Matteo Lorenzo Alessandro Davide Federico Simone Riccardo Luca Marco Andrea Giacomo Nicolò Edoardo Tommaso Gabriele Emanuele Filippo Francesco Giovanni Antonio Salvatore Stefano Fabio Daniele Roberto Mattia"
        +" Samuele Leonardo Alberto Claudio Michele Giuseppe Domenico Paolo Pietro Gianluca Cristian Emiliano Manuel Raffaele Vincenzo Valerio Giorgio Enrico -Massimo -Maurizio -Gianni -Carlo -Mauro -Fabrizio -Luciano -Cesare",
      a:"Rossi Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Ferrara Gatti Leone Pellegrini"
        +" Martini Fabbri Testa Vitale Serra Parisi Coppola Monti Villa Marchetti Bernardi Sala Palumbo Basile Valentini Orlando Cattaneo Morelli Amato Silvestri Riva Longo Ferri Fiore Guerra Pagano Piras Rota Ruggiero"
        +" Sanna Neri Gentile Benedetti Carbone Grasso Messina Battaglia Bellini Ferretti Pace Mazza Brambilla Cocco Donati Galli Gentili Lazzari Marchi Mele Negri Pozzi Rossetti Sartori Tedesco Vitali Zanetti Zucchi",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 ger:{ n:"Jonas Lukas Felix Leon Finn Niklas Tobias Maximilian Jan Tim Paul Moritz Florian Sven Daan Sem Bram Thijs Joris Lars Kevin Julian Philipp Sebastian Fabian Marcel Dennis Patrick Stefan Christian Markus Alexander"
        +" David Daniel Nico Robin Marvin Luca Noah Ben Elias Max Erik Jannik Kai Mario Tom Pascal Dominik Matthias Simon Oliver -Dieter -Jürgen -Klaus -Thomas -Michael -Andreas -Frank -Uwe -Wolfgang -Hans",
      a:"Müller Schmidt Schneider Fischer Weber Wagner Becker Hoffmann Schulz Koch Richter Klein Wolf Neumann Schwarz Zimmermann Braun Krüger Hofmann Lange Schmitt Werner Krause Meier Lehmann Schmid Schulze Maier Köhler"
        +" Herrmann König Walter Mayer Huber Kaiser Fuchs Peters Lang Scholz Möller Weiss Jung Hahn Schubert Vogel Friedrich Keller Günther Frank Berger Winkler Roth Beck Lorenz Baumann Franke Albrecht Schuster Ludwig Böhm"
        +" Winter Kraus Schumacher Krämer Vogt Stein Jäger Otto Sommer Gross Seidel Heinrich Brandt Haas Schreiber Graf De_Jong Bakker Visser Smit Meijer Mulder De_Boer Bos Vos Hendriks Dekker Van_den_Berg Jansen Dijkstra"
        +" Kuipers Hoekstra Brouwer Verhoeven Willems Maas Kok Jacobs Prins Huisman Koster Veenstra De_Groot Van_Leeuwen Van_der_Meer",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 en:{ n:"Jack Harry Oliver George Charlie Jamie Callum Connor Ryan Liam James Thomas William Joe Ben Sam Luke Adam Daniel Matthew Joshua Tom Michael Aaron Kieran Jordan Declan Reece Danny Josh Alex Nathan Mason Kyle Dean Chris"
        +" Marcus Lewis Tyler Sean Cian Conor -Gary -Steve -Mark -Paul -Neil -Andy",
      a:"Smith Taylor Walker Wright Hughes Edwards Hall Wood Clarke Turner Cooper Hill Ward Morris Murphy Kelly Byrne Doyle Jones Brown Williams Davies Evans Thomas Johnson Roberts Robinson Thompson White Green Harris Martin"
        +" Jackson Lewis Clark Allen Young King Scott Baker Adams Campbell Mitchell Carter Phillips Parker Collins Bell Fisher Reid Bennett Gray Watson Cox Palmer Hamilton Gordon Murray Fraser Ross Grant Armstrong"
        +" Gallagher Quinn Lynch Ryan Walsh Brennan Daly Fitzgerald McCarthy Sullivan Duffy Kennedy",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 bal:{ n:"Luka Marko Nikola Stefan Filip Ivan Milan Dusan Aleksandar Nemanja Mateo Josip Dario Domagoj Andrej Vladimir Milos Darko Goran Zoran Dejan Bojan Branko Danilo Dragan Igor Marin Mirko Petar Sasa Srdjan Tomislav"
        +" Vedran Zvonimir Ante Duje Lovro Borna Jakov Karlo Toni Mislav Nenad Predrag Slobodan",
      a:"Petrovic Jovanovic Nikolic Markovic Djordjevic Stojanovic Ilic Kovacevic Horvat Babic Matic Peric Tomic Knezevic Vukovic Radovic Simic Pavlovic Savic Lukic Jankovic Milosevic Stankovic Popovic Todorovic Vasic"
        +" Mitrovic Bogdanovic Ivanovic Maric Juric Kovac Novak Pavic Vidovic Bozic Rakic Radic Zivkovic Ristic Lazic Maksimovic Grgic Kolar Vrabec Zupan Kos Mlakar Golob",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 pl:{ n:"Jakub Krzysztof Piotr Mateusz Kamil Bartosz Michal Pawel Tomasz Marcin Lukasz Adrian Dawid Damian Patryk Szymon Kacper Filip Jan Maciej Wojciech Rafal Sebastian Dominik Karol Przemyslaw Grzegorz",
      a:"Kowalski Nowak Wisniewski Wojcik Kowalczyk Kaminski Zielinski Szymanski Wozniak Dabrowski Kozlowski Jankowski Mazur Kwiatkowski Krawczyk Piotrowski Grabowski Nowakowski Pawlowski Michalski Zajac Krol Wieczorek Jablonski Wrobel Majewski Olszewski Stepien Malinowski Jaworski Adamczyk Dudek Nowicki Pawlak Gorski Witkowski Walczak Sikora Baran Rutkowski Michalak Szewczyk Ostrowski Tomaszewski Pietrzak Zalewski Wroblewski Marciniak Jasinski Zawadzki Bak Jakubowski Sadowski Duda Wlodarczyk Wilk",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 ua:{ n:"Artem Mykola Oleksandr Vitaliy Ruslan Andriy Bohdan Denys Dmytro Maksym Serhiy Taras Viktor Vladyslav Yaroslav Yevhen Ihor Oleh Roman Stanislav Vadym Volodymyr Anatoliy Pavlo Illya Kyrylo",
      a:"Kovalenko Bondarenko Tkachenko Kravchenko Melnyk Boyko Lysenko Marchenko Moroz Savchenko Rudenko Polishchuk Shevchuk Kovalchuk Tkachuk Oliynyk Petrenko Ponomarenko Kuzmenko Kharchenko Pavlenko Hrytsenko Zinchuk Yaremenko Danylenko Honcharenko Panchenko Sydorenko Havrylenko Mazur Romanenko",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 ge:{ n:"Giorgi Luka Nika Levan Zurab Davit Irakli Nikoloz Lasha Mamuka Revaz Tornike Vakhtang Zaza Gela Beka Guram Otar Shota Temuri Merab Sandro Saba Tengiz Dato",
      a:"Beridze Kapanadze Gelashvili Maisuradze Tsiklauri Lobzhanidze Gvilia Chakvetadze Gogichaishvili Kiknadze Mchedlidze Jikia Gabunia Khubutia Lomidze Papava Shengelia Tabidze Zhorzholiani Janelidze Chikovani Gagnidze Abashidze Bakuradze Dolidze Mikeladze Kvirikashvili Natroshvili Okropiridze Tsereteli Chanturia",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] },

 jp:{ n:"Haruto Ryo Daichi Kenta Shun Yuta Sho Riku Kaito Hiroki Kota Yuki Koki Taiki Daiki Naoki Keisuke Takuma Junya Ritsu Yuma Reo Sota Ao Kazuki Masaya Hayato Shota",
      a:"Tanaka Suzuki Takahashi Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida Hayashi Saito Sasaki Matsumoto Inoue Kimura Shimizu Mori Ikeda Hashimoto Abe Ishikawa Ogawa Okada Goto Hasegawa Fujita Maeda Ota Murakami Kondo Ishii Sakamoto Endo Aoki Fujii Nishimura Fukuda Miura Takeuchi Nakajima Harada Ono",
      comp:"", pcomp:0, dob:0, ma:[], mn:[] }
};
