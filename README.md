# testingApp

//////////////////////////////////
Description je zmáčknuté do úzkého sloupce a zbytek vpravo je prázdný (totéž pravděpodobně platí pro ostatní sloupce, 
i když tam už to není takový problém

-Description rozšířenou na celý jeden řádek úpravou "Fill"

/////////////////////////////////
Na detailu není potřeba ID

-vymazán labeledText complex1.ID

/////////////////////////////////
Na konci detailu jsou dvě řádky "(Editace záznamu); (mazání záznamu), (vytvoření záznamu), (vyhledávání záznamů); 
(třídění záznamů); rozlišení na movies/series včetně rozdílného hodnocení" To tam asi nepatří 

-zápatí sloužící k programátorským účelům/ nově vymazáno

////////////////////////////////
V editačním módu jednak nemusí být ID a už určitě nemůže být editovatelné. Pokud ho uživatel změní, 
save se samozřejmě nepovede (server vrací 400 Bad request)


-vymazán labeledText complex1.ID i textBox complex1.ID

/////////////////////////////////
Pokud se rozlišuje detail a editace (viz tlačítko "edit record"), proč je i detail editovatelný?

-complex1.rating.seenItWhole „Is enabled“ False; 
-complex1.rating.dateOfWatching „Is enabled“ False

/////////////////////////////////
Tlačítko "Go without saving" by se asi mělo jmenovat "Cancel". 
Stejně tak "Save dit record to server" by se asi mohlo jmenovat "Save".

-	Tlačítka přejmenována


////////////////////////////////
	V editaci nejde přidat ani odebrat herce ani žánry

-	Nově přidaná funkčnost (mazání herců i žánrů zajišťuje "removeMe())

///////////////////////////////
na detailu se nezobrazují žánry
-	??????????

////////////////////////////////
	V detailu nejsou vidět epizody seriálu, stejně tak ani v editaci
