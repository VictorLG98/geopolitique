import sys
import os
# Add current directory to path so imports work when run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Post

ARTICLES = [
    {
        "slug": "batalla-soberania-artica",
        "title": "La Batalla por la Soberanía Ártica: Rutas, Recursos y Tensiones",
        "category": "Seguridad",
        "read_time": 7,
        "summary": "El deshielo del Polo Norte abre nuevas fronteras comerciales y militares. Examinamos las ambiciones de Rusia, el interés de la 'Ruta de la Seda Polar' de China y la respuesta de la OTAN.",
        "image_url": "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=800&q=80",
        "content": """El cambio climático está transformando el Ártico de una barrera impenetrable de hielo a un teatro clave de rivalidad geopolítica de cara al siglo XXI. A medida que las temperaturas polares aumentan al doble del promedio mundial, el retroceso de los glaciares está abriendo dos recursos estratégicos críticos: nuevas rutas de navegación comercial y yacimientos de hidrocarburos y minerales previamente inaccesibles.

### Las Nuevas Rutas de Navegación

Históricamente, el comercio marítimo global ha dependido de cuellos de botella controlados, como el **Canal de Suez** y el **Canal de Panamá**. El Ártico ofrece dos alternativas revolucionarias:

1. **La Ruta del Mar del Norte (NSR):** Controlada en gran medida por Rusia a lo largo de su costa siberiana. Reduce el tiempo de viaje entre Asia Oriental y Europa en casi un 40% en comparación con la ruta tradicional a través del Océano Índico y Suez.
2. **El Paso del Noroeste:** Que serpentea a través del archipiélago ártico canadiense, reduciendo significativamente las rutas de tránsito entre la costa este de EE. UU. y Asia.

### El Despertar de los Recursos

El Servicio Geológico de EE. UU. estima que el Ártico alberga aproximadamente el **22% de los recursos de petróleo y gas natural no descubiertos pero técnicamente recuperables del mundo**, así como inmensos depósitos de níquel, platino, tierras raras y oro. Quien domine esta región controlará una parte sustancial de la seguridad energética del futuro.

```
       EL REPARTO ÁRTICO (ZONAS ECONÓMICAS EXCLUSIVAS)
      
                 [ Océano Ártico ]
                /        |        \\
        [ Rusia ]    [ Canadá ]   [ EE.UU (Alaska) ]
         53% de        Gran          Base de radar
         costas       control         y patrullas
         árticas     marítimo          del Ártico
```

### Posicionamiento de las Potencias

* **Rusia:** Considera el Ártico como su prioridad estratégica y económica número uno. Moscú ha reabierto decenas de bases militares de la era soviética, desplegado sistemas de defensa aérea S-400 y cuenta con la mayor flota de rompehielos nucleares del mundo (la única de su tipo).
* **China:** Autodefinida como un *"Estado casi ártico"*, Pekín busca integrar la región en su Iniciativa de la Franja y la Ruta bajo el concepto de la **Ruta de la Seda Polar**, financiando proyectos de gas natural licuado (GNL) en Yamal y desarrollando rompehielos propios.
* **La OTAN:** Liderada por EE. UU., Canadá y los miembros escandinavos (incluidos los nuevos miembros Finlandia y Suecia), ha incrementado notablemente sus ejercicios militares polares para disuadir la militarización rusa.

El destino del Ártico determinará si la gobernanza internacional basada en tratados —como el Consejo Ártico— puede prevalecer ante el realismo geopolítico de las grandes potencias en un ecosistema frágil pero extraordinariamente estratégico."""
    },
    {
        "slug": "geopolitica-semiconductores-taiwan",
        "title": "La Geopolitica de los Semiconductores: El Estrecho de Taiwán y el Monopolio de TSMC",
        "category": "Tecnología",
        "read_time": 9,
        "summary": "Analizamos por qué los microchips se han convertido en el 'nuevo petróleo' y el papel central de la isla de Taiwán en la rivalidad tecnológica y militar entre EE. UU. y China.",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        "content": """En la era digital, la soberanía nacional ya no se mide únicamente en términos de territorio o barriles de crudo, sino en nanómetros. Los semiconductores —los diminutos chips que potencian desde teléfonos inteligentes y automóviles hasta sistemas de misiles guiados e Inteligencia Artificial— se han consolidado como el recurso estratégico más disputado del planeta.

### El 'Escudo de Silicio' de Taiwán

En el corazón de esta guerra tecnológica se encuentra **TSMC** (Taiwan Semiconductor Manufacturing Company). Fundada en 1987, TSMC fabrica más del **60% de los semiconductores del mundo y más del 90% de los chips de lógica avanzada** (menores a 7 nanómetros).

Esta concentración extrema de capacidad de manufactura avanzada otorga a Taiwán lo que los analistas denominan el *"Escudo de Silicio"*: una importancia tan crítica para la economía global que tanto Washington como Pekín tienen un interés vital en que la isla no caiga bajo el control hostil del otro.

```
                  LA CADENA DE VALOR DEL CHIP
                  
   [ Diseño ]      --->    [ Litografía (EUV) ]   --->   [ Manufactura ]
   EE.UU e Israel             Países Bajos                  Taiwán (TSMC)
 (NVIDIA, Apple)                 (ASML)                      y C. del Sur
```

### La Encrucijada de las Superpotencias

* **Estados Unidos:** Reconociendo su vulnerabilidad (ya que diseña los mejores chips pero no posee la infraestructura física para fabricar los más avanzados), ha aprobado la **Ley CHIPS y Ciencia**, dotada con más de 50.000 millones de dólares para incentivar que TSMC, Intel y Samsung construyan plantas avanzadas en suelo estadounidense (como en Arizona y Texas).
* **China:** Aunque gasta más dinero importando chips que petróleo, Pekín lucha activamente por lograr la autosuficiencia tecnológica a través de su plan *Made in China 2025*. Sin embargo, las restricciones a la exportación de EE. UU. y Europa —especialmente el veto a la venta de máquinas de litografía ultravioleta extrema (EUV) de la firma neerlandesa **ASML**— han frenado significativamente el avance tecnológico de las fundiciones chinas como SMIC.

### ¿Un Punto de Quiebre?

Un conflicto militar en el Estrecho de Taiwán detendría instantáneamente la producción de TSMC. Las estimaciones de Bloomberg sugieren que una interrupción total del suministro de chips taiwaneses podría restarle al PIB mundial unos **10 billones de dólares** (aproximadamente el 10% del PIB global) en su primer año, desencadenando una parálisis industrial global sin precedentes en la historia moderna.

La batalla por la supremacía tecnológica continuará librándose en los laboratorios de diseño y las salas limpias de fundición, donde cada nanómetro ganado representa una ventaja geopolítica clave."""
    },
    {
        "slug": "litio-andino-triangulo-oro",
        "title": "El Litio Andino y el Triángulo de Oro: Sudamérica en la Mira Tecnológica",
        "category": "Economía",
        "read_time": 6,
        "summary": "Bolivia, Argentina y Chile concentran el 60% de las reservas mundiales de litio. Evaluamos los retos del nacionalismo de recursos y la competencia entre EE. UU. y China por asegurar la transición verde.",
        "image_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
        "content": """La transición energética global desde los combustibles fósiles hacia la electrificación ha desatado una carrera frenética por las materias primas críticas. De todas ellas, el **litio** —bautizado como el *"oro blanco"* por su papel indispensable en la fabricación de baterías de iones de litio para vehículos eléctricos e infraestructura de almacenamiento— es el rey indiscutible.

En este nuevo mapa de poder de recursos, Sudamérica ocupa un rol central a través del denominado **Triángulo del Litio**.

### El Corazón del Oro Blanco

El Triángulo del Litio, una zona geográfica andina situada en los límites de **Bolivia, Argentina y Chile**, alberga aproximadamente el **56% al 60% de los recursos identificados de litio en el planeta**, principalmente en forma de salares de alta altitud (como el Salar de Uyuni en Bolivia, el Salar de Atacama en Chile y los salares de Jujuy y Salta en Argentina).

A diferencia del litio extraído de roca dura en Australia (el principal productor de volumen actual), el litio de salar sudamericano se extrae mediante procesos de evaporación solar de salmuera. Aunque requiere grandes volúmenes de agua y amplios tiempos de procesamiento, es significativamente más económico de refinar a grado de batería.

```
                   EL TRIÁNGULO DEL LITIO
                   
                        [ BOLIVIA ]
                     (Salar de Uyuni)
                     /             \\
                    /               \\
            [ CHILE ] ------------ [ ARGENTINA ]
       (Salar de Atacama)        (Jujuy/Salta/Catamarca)
```

### Nacionalismo de Recursos vs. Inversión Extranjera

Cada uno de los tres países andinos ha optado por un modelo regulatorio y económico radicalmente distinto para gestionar su riqueza:

1. **Chile:** Históricamente el productor más eficiente del área. Ha declarado al litio como recurso estratégico no concesionable, operando a través de contratos de arrendamiento estatales con gigantes como SQM y Albemarle. Recientemente, el gobierno ha anunciado su *Estrategia Nacional del Litio*, buscando un modelo híbrido público-privado liderado por la estatal Codelco.
2. **Argentina:** Mantiene un enfoque descentralizado muy favorable para la inversión corporativa privada. Las provincias son dueñas originarias de los recursos geológicos, lo que ha generado una avalancha de capitales internacionales (estadounidenses, chinos, canadienses y franceses) que compiten por construir plantas de carbonato de litio.
3. **Bolivia:** Cuenta con los mayores recursos brutos del planeta (estimados en 21 millones de toneladas en Uyuni), pero su explotación ha sido lenta debido a desafíos técnicos en la composición de la salmuera (alto magnesio) y a una política de control estatal absoluto. Recientemente ha firmado convenios estratégicos con consorcios chinos (CBC) y rusos (Uranium One) para implementar tecnologías de Extracción Directa de Litio (EDL).

### El Dilema del Eslabón Final

El principal desafío geopolítico para Sudamérica es evitar la histórica *"maldición de los recursos naturales"*: exportar sal de litio cruda e importar baterías terminadas. Sin embargo, escalar en la cadena de valor hacia la producción local de celdas de batería requiere infraestructura de alta tecnología, mercados domésticos integrados y un volumen masivo de energía barata, desafíos pendientes en la región.

El Triángulo del Litio será el escenario donde se decidirá el equilibrio de poder de suministro de la transición ecológica de Occidente y Asia."""
    }
]

def seed_db(db: Session):
    print("Checking if seeding is required...")
    # Verify if database is already populated
    post_count = db.query(Post).count()
    if post_count > 0:
        print(f"Database already seeded with {post_count} articles. Skipping.")
        return

    print("Seeding database with premium geopolitical articles...")
    for art in ARTICLES:
        db_post = Post(
            slug=art["slug"],
            title=art["title"],
            category=art["category"],
            read_time=art["read_time"],
            summary=art["summary"],
            content=art["content"],
            image_url=art["image_url"]
        )
        db.add(db_post)
    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    # Create tables if run as a standalone script
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
