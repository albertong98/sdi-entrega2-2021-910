package com.uniovi.tests.util;

import java.util.LinkedList;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

public class InsertSampleData {
	static List<Document> users = new LinkedList<Document>();
	static List<Document> offers = new LinkedList<Document>();
	static List<Document> orders = new LinkedList<Document>();
	static List<Document> messages = new LinkedList<Document>();
	
	static MongoDatabase database = null;
	
	public static void connect() {
		ConnectionString connString = new ConnectionString("mongodb+srv://admin:sdi@mywallapop.vadns.mongodb.net/myFirstDatabase?w=majority");
		MongoClientSettings settings = MongoClientSettings.builder()
			    .applyConnectionString(connString)
			    .retryWrites(true)
			    .build();
		
		MongoClient mongoClient = MongoClients.create(settings);
		database = mongoClient.getDatabase("myFirstDatabase");
	}
	
	public static void initDb() {
		database.getCollection("usuarios").insertMany(users);
		database.getCollection("ofertas").insertMany(offers);
		database.getCollection("compras").insertMany(orders);
		database.getCollection("mensajes").insertMany(messages);
	}
	
	public static void deleteAll() {
		database.getCollection("usuarios").deleteMany(new Document());
		database.getCollection("ofertas").deleteMany(new Document());
		database.getCollection("compras").deleteMany(new Document());
		database.getCollection("mensajes").deleteMany(new Document());
	}
	
	public static void loadUsers(String password){
		Document user1 = new Document("_id", new ObjectId())
                			.append("email", "pedro@email.es")
                			.append("password", password)
                			.append("name", "Pedro")
                			.append("lastname", "Martinez")
                			.append("rol", "estandar")
                			.append("saldo",100.0);
		Document user2 = new Document("_id", new ObjectId())
			    			.append("email", "lucas@email.es")
			    			.append("password",password)
			    			.append("name", "Lucas")
			    			.append("lastname", "Martinez")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document user3 = new Document("_id", new ObjectId())
			    			.append("email", "maria@email.es")
			    			.append("password", password)
			    			.append("name", "Maria")
			    			.append("lastname", "Fernandez")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document user4 = new Document("_id", new ObjectId())
			    			.append("email", "marta@email.es")
			    			.append("password",password)
			    			.append("name", "Marta")
			    			.append("lastname", "Garcia")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document user5 = new Document("_id", new ObjectId())
			    			.append("email", "pelayo@email.es")
			    			.append("password", password)
			    			.append("name", "Pelayo")
			    			.append("lastname", "Martinez")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document user6 = new Document("_id", new ObjectId())
			    			.append("email", "martin@email.es")
			    			.append("password", password)
			    			.append("name", "Martin")
			    			.append("lastname", "Martinez")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document user7 = new Document("_id", new ObjectId())
			    			.append("email", "alberto@email.com")
			    			.append("password",password)
			    			.append("name", "Alberto")
			    			.append("lastname", "Martinez")
			    			.append("rol", "estandar")
			    			.append("saldo",100.0);
		Document admin = new Document("_id", new ObjectId())
			    			.append("email", "admin@email.com")
			    			.append("password", PasswordEncrypter.encrypt("admin"))
			    			.append("name", "Admin")
			    			.append("lastname", "Admin")
			    			.append("rol", "administrador")
			    			.append("saldo",0.0);
		users.add(user1);
		users.add(user2);
		users.add(user3);
		users.add(user4);
		users.add(user5);
		users.add(user6);
		users.add(user7);
		users.add(admin);
	}
	
	public static void loadOffers(){
		ObjectId orderId =  new ObjectId();
		Document offer1user1 = new Document("_id", orderId)
                			.append("title", "Coche")
                			.append("details", "coche 20000 km")
                			.append("price", 10.0)
                			.append("date", new java.sql.Date(System.currentTimeMillis()))
                			.append("seller","pedro@email.es");
		Document offer1user2 = new Document("_id", new ObjectId())
			    			.append("title", "Cama")
			    			.append("details", "Cama con poco uso")
			    			.append("price", 13.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","lucas@email.es");
		Document offer2user2 = new Document("_id", new ObjectId())
			    			.append("title", "Joya")
			    			.append("details", "Joya con poco uso")
			    			.append("price", 100.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","lucas@email.es");
		Document offer1user3 = new Document("_id", new ObjectId())
			    			.append("title", "Consola")
			    			.append("details", "Consola con poco uso")
			    			.append("price", 20.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","maria@email.es");
		Document offer2user3 = new Document("_id", new ObjectId())
			    			.append("title", "Avion")
			    			.append("details", "avion privado pocos km")
			    			.append("price", 150.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","maria@email.es");
		ObjectId orderId1 =  new ObjectId();
		Document offer1user5 = new Document("_id", orderId1)
			    			.append("title", "Zapatos")
			    			.append("details", "Zapatos talla 39")
			    			.append("price", 20.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","pelayo@email.es");
		ObjectId orderId2 =  new ObjectId();
		Document offer2user5 = new Document("_id", orderId2)
			    			.append("title", "Vaqueros")
			    			.append("details", "Vaqueros talla 42")
			    			.append("price", 14.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","pelayo@email.es");
		
		ObjectId orderId3 =  new ObjectId();
		Document offer3user5 = new Document("_id", orderId3)
			    			.append("title", "Chaqueta")
			    			.append("details", "Chaqueta talla L")
			    			.append("price", 15.0)
			    			.append("date", new java.sql.Date(System.currentTimeMillis()))
			    			.append("seller","pelayo@email.es");
		
		offers.add(offer1user1);
		offers.add(offer1user2);
		offers.add(offer2user2);
		offers.add(offer1user3);
		offers.add(offer2user3);
		offers.add(offer1user5);
		offers.add(offer2user5);
		offers.add(offer3user5);
		
		loadOrders(orderId1,orderId2,orderId3);
		loadMessages("pelayo@email.es",orderId);
		loadMessages("pedro@email.es",orderId1,orderId2,orderId3);
	}
	
	static void loadOrders(ObjectId... ids) {
		for(ObjectId id: ids)
			orders.add(new Document("_id", new ObjectId())
    			.append("comprador","pedro@email.es")
				.append("ofertaId",id));
	}
	
	static void loadMessages(String comprador,ObjectId... ids) {
		for(ObjectId id: ids)
			messages.add(new Document("_id", new ObjectId())
    			.append("comprador",comprador)
    			.append("autor",comprador)
				.append("ofertaId",id)
				.append("date",new java.sql.Date(System.currentTimeMillis()))
				.append("text", "Buenas me interesa el articulo.")
				.append("leido", false));
	}
}
