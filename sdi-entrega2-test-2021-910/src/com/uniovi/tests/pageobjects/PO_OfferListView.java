package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_OfferListView extends PO_NavView{
	public static void checkEmptyTable(WebDriver driver) {
		List<WebElement> elementos = driver.findElements(By.xpath("//table/tbody/descendant::td"));
		assertTrue(elementos.isEmpty());
	}
	
	public static void buyOffer(WebDriver driver,String texto) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free","//td[contains(text(), '"+texto+"')]/following-sibling::*/a[contains(@href, 'offer/buy')]");
		elementos.get(0).click();
	}
	
	public static void checkOfferDeleted(WebDriver driver, int offerIndex) {
		//Se obtienen todos los campos td
		List<WebElement> elementos = PO_View.checkElement(driver, "free","//td");
		//Recuperamos el campo título de la oferta indicada por el parametro offerIndex
		String texto = elementos.get(offerIndex*4).getText();
		//Se obtienen todos los enlaces para eliminar ofertas de la tabla
		elementos = PO_View.checkElement(driver, "free","//td[contains(text(), '')]/following-sibling::*/a[contains(@href, 'offer/delete')]");
		//Seleccionamos el enlace indicado por el parametro offerIndex
		elementos.get(offerIndex).click();
		//Se comprueba que el titulo obtenido anteriormente ya no se encuentra en la tabla
		PO_View.checkElementNotInPage(driver, texto);
	}
	
	public static void checkLast(WebDriver driver) {
		int i = PO_View.checkElement(driver, "free","//tr").size() - 2;
		checkOfferDeleted(driver,i);
	}
}
